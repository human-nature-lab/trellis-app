<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('names') }}
      </v-toolbar-title>
      <v-spacer />
      <permission :role-whitelist="['admin','manager']">
        <v-tooltip lazy left>
          <v-btn
            slot="activator"
            icon
            @click="isAdding = true">
            <v-icon>add</v-icon>
          </v-btn>
          <span>{{$t('add_respondent_name')}}</span>
        </v-tooltip>
      </permission>
    </v-toolbar>
    <v-data-table
      class="mb-3"
      :headers="nameHeaders"
      :items="respondent.names"
      hide-actions>
      <template slot="items" slot-scope="props">
        <td>{{props.item.name}}</td>
        <td>
          <v-icon v-if="props.item.isDisplayName">check</v-icon>
        </td>
        <td>
          <permission :role-whitelist="['admin','manager']">
            <v-btn
              icon
              @click="currentName = props.item; isEditing = true">
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
              icon
              @click="removeName(props.item.id)">
              <v-progress-circular v-if="isDeleting(props.item.id)" indeterminate/>
              <v-icon v-else>delete</v-icon>
            </v-btn>
          </permission>
        </td>
      </template>
    </v-data-table>
    <RespondentNameForm
      v-model="isAdding"
      :respondent="respondent"
      @close="doneAddingName"/>
    <RespondentNameForm
      v-model="isEditing"
      :name="currentName"
      :respondent="respondent"
      @close="doneEditingName"/>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Permission from '../Permission'
  // @ts-ignore
  import RespondentNameForm from './RespondentNameForm'
  import Vue from 'vue'
  import RespondentName from "../../entities/trellis/RespondentName"
  import RespondentService from "../../services/respondent/RespondentService"

  export default Vue.extend({
    data () {
      return {
        isEditing: false,
        isAdding: false,
        deleting: [],
        error: null,
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
          this.error = `Cannot delete the display name for a respondent`
          return
        }
        this.deleting[nameId] = true
        try {
          await RespondentService.removeName(this.respondent.id, nameId)
          let index = this.respondent.names.findIndex(name => name.id === nameId)
          this.respondent.names.splice(index, 1)
        } catch (err) {
          console.error(err)
          this.error = `Failed to delete the respondent name -> ${name.name}`
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
