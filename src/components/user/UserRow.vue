<template>
  <tr>
    <td class="actions">
      <CRUDMenu
        :editable="hasPermission(TrellisPermission.EDIT_USER)"
        :removable="hasPermission(TrellisPermission.REMOVE_USER)"
        @edit="$emit('edit')"
        @remove="$emit('remove')" />
    </td>
    <td>{{user.name}}</td>
    <td>{{user.username}}</td>
    <td>{{user.role && user.role.name}}</td>
    <td>
      <v-select
        :loading="loading"
        :items="allStudies"
        item-text="name"
        item-value="id"
        :readonly="!hasPermission(TrellisPermission.EDIT_USER)"
        v-model="selectedStudies"
        @change="saveUserStudies"
        dense
        autocomplete
        multiple
        chips />
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import User from '../../entities/trellis/User'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import StudyService from '../../services/study/StudyService'
  import UserService from '../../services/user/UserService'
  import global from '../../static/singleton'
  import IsAdminMixin from '../../mixins/IsAdminMixin'
  import CRUDMenu from '../CRUDMenu'

  export default Vue.extend({
    name: 'UserRow',
    mixins: [IsAdminMixin, PermissionMixin],
    components: { CRUDMenu },
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
      isAdminOrOwner (): boolean {
        // @ts-ignore
        return this.isAdmin || (!!this.user && this.user.id === this.global.user.id)
      }
    },
    async created () {
      this.loading = true
      try {
        this.allStudies = await StudyService.getAllStudies()
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      } finally {
        this.loading = false
      }
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
        try {
          let userStudy = await UserService.addStudy(this.user, studyId)
          this.user.studies.push(userStudy)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async removeUserStudy (userStudyId: String ) {
        try {
          await UserService.removeStudy(this.user, userStudyId)
          const index = this.user.studies.findIndex(s => s.id === userStudyId)
          this.user.studies.splice(index, 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      }
    }
  })
</script>

<style lang="sass" scoped>
  .actions
    white-space: nowrap
</style>
