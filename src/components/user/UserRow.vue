<template>
  <tr>
    <td>{{user.name}}</td>
    <td>{{user.username}}</td>
    <td>{{user.role}}</td>
    <td>
      <v-select
        :loading="loading"
        :items="allStudies"
        item-text="name"
        item-value="id"
        v-model="selectedStudies"
        @change="saveUserStudies"
        dense
        autocomplete
        multiple
        chips />
    </td>
    <td class="justify-right justify-content-right layout px-0">
      <v-btn icon small class="mx-0" @click="$emit('edit')" :disabled="!isAdminOrOwner">
        <v-icon>edit</v-icon>
      </v-btn>
      <v-btn icon small class="mx-0" @click="$emit('delete')" :disabled="!isAdmin">
        <v-icon color="error">delete</v-icon>
      </v-btn>
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from "vue"
  import User from "../../entities/trellis/User"
  import StudyService from "../../services/study/StudyService"
  import UserService from "../../services/user/UserService"
  import UserStudy from "../../entities/trellis/UserStudy"
  import global from '../../static/singleton'

  export default Vue.extend({
    name: 'UserRow',
    props: {
      user: Object as () => User
    },
    computed: {
      selectedStudies: {
        get (): string[] {
          return this.user.studies ?  this.user.studies.map(s => s.studyId) : []
        },
        set (val) {}
      },
      isAdmin (): boolean {
        return !!this.global && !!this.global.user && this.global.user.role === 'ADMIN'
      },
      isAdminOrOwner (): boolean {
        return this.isAdmin || (!!this.user && this.user.id === this.global.user.id)
      }
    },
    async created () {
      this.loading = true
      this.allStudies = await StudyService.getAllStudies()
      this.loading = false
    },
    data () {
      return {
        global,
        loading: false,
        showEditUser: false,
        allStudies: []
      }
    },
    methods: {
      saveUserStudies (newStudies) {
        // Basic diff grabbing added and removed values
        for (let studyId of newStudies) {
          if (this.selectedStudies.indexOf(studyId) === -1) {
            this.addUserStudy(studyId)
          }
        }
        for (let studyId of this.selectedStudies) {
          if (newStudies.indexOf(studyId) === -1) {
            this.removeUserStudy(studyId)
          }
        }
      },
      async addUserStudy (studyId: string) {
        let userStudy = await UserService.addStudy(this.user, studyId)
        this.user.studies.push(userStudy)
      },
      async removeUserStudy (userStudyId: String ) {
        await UserService.removeStudy(this.user, userStudyId)
        const index = this.user.studies.findIndex(s => s.id === userStudyId)
        this.user.studies.splice(index, 1)
      }
    }
  })
</script>

<style scoped>

</style>
