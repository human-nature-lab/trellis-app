<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('names') }}
      </v-toolbar-title>
      <v-spacer />
      <Permission :requires="TrellisPermission.ADD_RESPONDENT_NAME">
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              icon
              @click="isAdding = true">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>{{$t('add_respondent_name')}}</span>
        </v-tooltip>
      </Permission>
    </v-toolbar>
    <v-data-table
      class="mb-4"
      :headers="nameHeaders"
      :items="respondent.names"
      hide-default-footer>
      <template v-slot:item="props">
        <tr>
          <td>{{props.item.name}}</td>
          <td>
            <v-icon v-if="props.item.isDisplayName">mdi-check</v-icon>
          </td>
          <td>
            <Permission :requires="TrellisPermission.EDIT_RESPONDENT_NAME">
              <v-btn
                icon
                @click="currentName = props.item; isEditing = true">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </Permission>
            <Permission :requires="TrellisPermission.REMOVE_RESPONDENT_NAME">
              <v-btn
                icon
                @click="removeName(props.item.id)">
                <v-progress-circular v-if="isDeleting(props.item.id)" indeterminate/>
                <v-icon v-else>mdi-delete</v-icon>
              </v-btn>
            </Permission>
          </td>
        </tr>
      </template>
    </v-data-table>
    <RespondentNameForm
      v-model="isAdding"
      :respondent="respondent"
      @close="doneAddingName"/>
    <RespondentNameForm
      v-if="currentName !== null"
      v-model="isEditing"
      :name="currentName"
      :respondent="respondent"
      @close="doneEditingName"/>
  </v-flex>
</template>

<script lang="ts">
  import Permission from '../Permission.vue'
  import RespondentNameForm from './RespondentNameForm.vue'
  import Vue from 'vue'
  import RespondentName from '../../entities/trellis/RespondentName'
  import RespondentService from '../../services/respondent/RespondentService'

  export default Vue.extend({
    data () {
      return {
        isEditing: false,
        isAdding: false,
        deleting: [],
        currentName: null,
        nameHeaders: [{
          text: 'Name',
          value: 'name',
          class: 'main-column'
        }, {
          text: 'Current',
          value: 'isCurrent'
        }, {
          text: '',
          value: 'actions'
        }]
      }
    },
    props: {
      respondent: {
        type: Object,
        required: true
      }
    },
    components: {RespondentNameForm, Permission},
    name: 'RespondentNames',
    methods: {
      isDeleting (id: string): boolean {
        return this.deleting[id]
      },
      async removeName (nameId: string): Promise<void> {
        let name = this.respondent.names.find(name => name.id === nameId)
        if (name && name.isDisplayName) {
          this.alert('error', `Cannot delete the display name for a respondent`)
          return
        }
        this.deleting[nameId] = true
        try {
          await RespondentService.removeName(this.respondent.id, nameId)
          let index = this.respondent.names.findIndex(name => name.id === nameId)
          this.respondent.names.splice(index, 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, `Failed to delete the respondent name -> ${name.name}`)
          }
        } finally {
          this.deleting[nameId] = false
          this.$forceUpdate()
        }
      },
      doneAddingName (name: RespondentName): void {
        if (name) {
          if (name.isDisplayName) {
            this.respondent.names.forEach(name => {
              name.isDisplayName = false
            })
          }
          this.respondent.names.push(name)
        }
        this.isAdding = false
      },
      doneEditingName (name: RespondentName): void {
        let oldIndex = this.respondent.names.findIndex(n => name.previousRespondentNameId === n.id)
        this.respondent.names.splice(oldIndex, 1, name)
        this.isEditing = false
      },
    }
  })
</script>

<style scoped>

</style>
