<template>
  <v-card tile>
    <v-toolbar card prominent>
      <v-toolbar-title>{{ $t('respondent') }}: {{name}}</v-toolbar-title>
      <v-spacer />
      <v-btn :to="{name: 'RespondentForms', params: {studyId: global.study.id, respondentId: respondent.id}}">
        {{ $t('forms') }}
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-alert v-show="error" type="error">
        {{error}}
      </v-alert>
      <v-toolbar flat>
        <v-toolbar-title>
          {{ $t('photos') }}
        </v-toolbar-title>
        <v-spacer />
        <permission :role-whitelist="['admin','manager']">
          <v-btn
            icon
            @click="isAddingPhoto = true">
            <v-icon>add</v-icon>
          </v-btn>
        </permission>
      </v-toolbar>
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <Photo
            v-for="photo in respondent.photos"
            :is-contained="true"
            :height="250"
            :width="250"
            :key="photo.id"
            :photo="photo"/>
        </v-layout>
      </v-container>
      <RespondentGeos
        :use-census-form="true"
        :study-id="global.study.id"
        :respondent="respondent" />
      <v-toolbar flat>
        <v-toolbar-title>
          {{ $t('condition_tags') }}
        </v-toolbar-title>
        <v-spacer />
        <permission :role-whitelist="['admin','manager']">
          <v-btn
            icon
            class="mb-2"
            @click="modal.conditionTag = true">
            <v-icon>add</v-icon>
          </v-btn>
        </permission>
      </v-toolbar>
      <v-data-table
        class="mb-3"
        hide-actions
        :headers="conditionTagHeaders"
        :items="respondent.respondent_condition_tags">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.updated_at }}</td>
          <td class="text-xs-right">{{ props.item.created_at }}</td>
          <permission :role-whitelist="['admin', 'manager']">
            <td>
              <v-btn
                icon
                @click="deleteRespondentConditionTag(props.item.pivot.id)">
                <v-progress-circular
                  v-if="isDeleting(props.item.pivot.id)"
                  indeterminate />
                <v-icon v-else>delete</v-icon>
              </v-btn>
            </td>
          </permission>
        </template>
      </v-data-table>
      <v-toolbar flat>
        <v-toolbar-title>
          {{ $t('names') }}
        </v-toolbar-title>
        <v-spacer />
        <permission :role-whitelist="['admin','manager']">
          <v-btn
            icon
            @click="modal.addName = true">
            <v-icon>add</v-icon>
          </v-btn>
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
            <v-icon v-if="props.item.is_display_name">check</v-icon>
          </td>
          <permission :role-whitelist="['admin','manager']">
            <td>
              <v-btn
                icon
                @click="editing.name = props.item; modal.editName = true">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                icon
                @click="removeName(props.item.id)">
                <v-progress-circular v-if="isDeleting(props.item.id)" indeterminate/>
                <v-icon v-else>delete</v-icon>
              </v-btn>
            </td>
          </permission>
        </template>
      </v-data-table>
    </v-card-text>
    <v-dialog
      v-model="isAddingPhoto"
      lazy>
      <v-container>
        <v-card>
          <v-btn @click="photoFromCamera">
            <v-icon>photo_camera</v-icon>
          </v-btn>
          <v-btn @click="photoFromFile">
            <v-icon>cloud_upload</v-icon>
          </v-btn>
        </v-card>
      </v-container>
    </v-dialog>
    <v-dialog
      v-model="modal.addName"
      lazy>
      <RespondentName
        :respondent="respondent"
        @close="doneAddingName"/>
    </v-dialog>
    <v-dialog
      v-model="modal.editName"
      lazy>
      <RespondentName
        :name="editing.name"
        :respondent="respondent"
        @close="doneEditingName"/>
    </v-dialog>
    <v-dialog
      lazy
      v-model="modal.conditionTag">
      <v-card>
        <RespondentConditionTagForm
          :respondentId="respondent.id"
          :condition-tag="editing.conditionTag"
          @close="doneAddingRespondentConditionTag"/>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import Permission from '../Permission'
  import Photo from '../Photo'
  import RespondentName from './RespondentName'
  import RespondentConditionTagForm from './RespondentConditionTagForm'
  import RespondentService from '../../services/respondent/RespondentService'
  import ConditionTagService from '../../services/condition-tag/ConditionTagService'
  import RespondentGeos from './RespondentGeos'

  /**
   * The respondent info router loader
   * @param {Route} route - A VueRouter route object
   * @returns {Promise<Object>|*}
   */
  function preloadRespondent (route) {
    let respondentId = route.params.respondentId
    return RespondentService.getRespondentById(respondentId)
  }

  export default {
    name: 'respondent-info',
    mixins: [RouteMixinFactory(preloadRespondent)],
    data () {
      return {
        respondent: null,
        error: null,
        deleting: {},
        editing: {
          name: null,
          geo: null
        },
        modal: {
          editName: false,
          addName: false,
          geoSearch: false,
          conditionTag: false
        },
        isAddingPhoto: false,
        conditionTagHeaders: [{
          text: 'Tag name',
          value: 'name'
        }, {
          text: 'Last updated',
          value: 'updated_at'
        }, {
          text: 'Created at',
          value: 'created_at'
        }],
        nameHeaders: [{
          text: 'Name',
          value: 'name'
        }, {
          text: 'Current',
          value: 'is_current'
        }]
      }
    },
    methods: {
      hydrate (respondent) {
        this.respondent = respondent
      },
      photoFromCamera () {},
      photoFromFile () {},
      removeName (nameId) {
        let name = this.respondent.names.find(name => name.id === nameId)
        if (name && name.is_display_name) {
          this.error = `Cannot delete the display name for a respondent`
          return
        }
        this.deleting[nameId] = true
        RespondentService.removeName(this.respondent.id, nameId).then(res => {
          let index = this.respondent.names.findIndex(name => name.id === nameId)
          this.respondent.names.splice(index, 1)
        }).catch(err => {
          console.error(err)
          this.error = `Failed to delete the respondent name -> ${name.name}`
        }).finally(() => {
          this.deleting[nameId] = false
          this.$forceUpdate()
        })
      },
      doneAddingName (name) {
        if (name) {
          this.respondent.names.push(name)
        }
        this.modal.addName = false
      },
      doneEditingName (name) {
        let oldIndex = this.respondent.names.findIndex(n => name.previous_respondent_name_id)
        this.respondent.names.splice(oldIndex, 1, [name])
        this.modal.editName = false
      },
      doneAddingRespondentConditionTag (tag) {
        this.respondent.respondent_condition_tags.push(tag)
        this.modal.conditionTag = false
      },
      deleteRespondentConditionTag (respondentConditionTagId) {
        // TODO: Finish UI for removing respondent condition tags
        if (!window.confirm(`Are you sure you want to delete this respondent condition tag?`)) return
        this.deleting[respondentConditionTagId] = true
        ConditionTagService.removeRespondentConditionTag(this.respondent.id, respondentConditionTagId).then(msg => {
          let index = this.respondent.respondent_condition_tags.findIndex(t => t.pivot.id === respondentConditionTagId)
          this.respondent.respondent_condition_tags.splice(index, 1)
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.deleting[respondentConditionTagId] = false
        })
      },
      isDeleting (id) {
        return this.deleting[id]
      }
    },
    computed: {
      name () {
        let rName = this.respondent.names.find(n => n.is_display_name)
        return rName ? rName.name : this.respondent.name
      }
    },
    components: {
      Photo,
      RespondentName,
      Permission,
      RespondentConditionTagForm,
      RespondentGeos
    }
  }
</script>

<style lang="sass" scoped>
  .table
    td
      &:first-child
        width: 100%
      &:last-child
        white-space: nowrap
  .add-photo
    width: 250px
    height: 250px
    flex-grow: 0
    button
      width: 100%
      height: 100%
</style>
