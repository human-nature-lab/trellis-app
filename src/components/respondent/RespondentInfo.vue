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
        :items="respondent.respondentConditionTags">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.conditionTag.name }}</td>
          <td class="text-xs-right">{{ props.item.createdAt.format('l') }}</td>
          <permission :role-whitelist="['admin', 'manager']">
            <td>
              <v-btn
                icon
                @click="deleteRespondentConditionTag(props.item.id)">
                <v-progress-circular
                  v-if="isDeleting(props.item.id)"
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
            <v-icon v-if="props.item.isDisplayName">check</v-icon>
          </td>
          <td>
            <permission :role-whitelist="['admin','manager']">
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
            </permission>
          </td>
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

<script lang="ts">
  // @ts-ignore
  import Permission from '../Permission'
  // @ts-ignore
  import Photo from '../Photo'
  // @ts-ignore
  import RespondentName from './RespondentName'
  // @ts-ignore
  import RespondentConditionTagForm from './RespondentConditionTagForm'
  // @ts-ignore
  import RespondentGeos from './RespondentGeos'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import RespondentService from '../../services/respondent/RespondentService'
  import ConditionTagWeb from '../../services/condition-tag/ConditionTagWeb'
  import Respondent from '../../entities/trellis/Respondent'
  import Vue from 'vue'
  import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
  import singleton from '../../static/singleton'

  /**
   * The respondent info router loader
   * @param {Route} route - A VueRouter route object
   * @returns {Promise<Object>|*}
   */
  function preloadRespondent (route) {
    let respondentId = route.params.respondentId
    return RespondentService.getRespondentById(respondentId)
  }

  export default Vue.extend({
    name: 'respondent-info',
    mixins: [RouteMixinFactory(preloadRespondent)],
    data () {
      return {
        global: singleton,
        respondent: null as Respondent,
        error: null as any,
        deleting: {} as object,
        editing: {
          name: null as string,
          geo: null as string
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
          text: 'Date added',
          value: 'created_at',
          width: '15%'
        }, {
          text: '',
          value: 'remove',
          width: '10%'
        }],
        nameHeaders: [{
          text: 'Name',
          value: 'name'
        }, {
          text: 'Current',
          value: 'is_current'
        }, {
          text: '',
          value: 'actions'
        }]
      }
    },
    methods: {
      hydrate (respondent: Respondent) {
        console.log('hydrate', respondent)
        this.respondent = respondent
      },
      photoFromCamera () {},
      photoFromFile () {},
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
          this.respondent.names.push(name)
        }
        this.modal.addName = false
      },
      doneEditingName (name: RespondentName): void {
        let oldIndex = this.respondent.names.findIndex(n => name.previousRespondentNameId === n.id)
        this.respondent.names.splice(oldIndex, 1, name)
        this.modal.editName = false
      },
      doneAddingRespondentConditionTag (tag: RespondentConditionTag): void {
        this.respondent.respondentConditionTags.push(tag)
        this.modal.conditionTag = false
      },
      async deleteRespondentConditionTag (respondentConditionTagId: string): Promise<void> {
        // TODO: Finish UI for removing respondent condition tags
        if (!window.confirm(`Are you sure you want to delete this respondent condition tag?`)) return
        this.deleting[respondentConditionTagId] = true
        try {
          await ConditionTagWeb.removeRespondentConditionTag(this.respondent.id, respondentConditionTagId)
          let index = this.respondent.respondentConditionTags.findIndex(t => t.id === respondentConditionTagId)
          this.respondent.respondentConditionTags.splice(index, 1)
        } catch (err) {
          this.error = err
        } finally {
          this.deleting[respondentConditionTagId] = false
        }
      },
      isDeleting (id: string): boolean {
        return this.deleting[id]
      }
    },
    computed: {
      name (): string {
        let rName = this.respondent.names.find(n => n.isDisplayName)
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
  })
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
