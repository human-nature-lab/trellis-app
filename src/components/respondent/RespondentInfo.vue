<template>
  <v-card tile>
    <v-toolbar card prominent>
      <v-toolbar-title>Respondent Info</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-alert v-if="error">
        {{error}}
      </v-alert>
      <v-container fluid>
        <h3>Names</h3>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">{{name}}</div>
            <v-card>
              <v-container fluid>
                <table class="table datatable">
                  <tr v-for="(name, index) in respondent.names" :key="name.id">
                    <td>{{name.name}}</td>
                    <td>
                      <span>
                        <v-btn
                          icon
                          @click="modal.addName = true">
                          <v-icon>add</v-icon>
                        </v-btn>
                         <v-btn
                           icon
                           @click="editing.name = name; modal.editName = true">
                          <v-icon>edit</v-icon>
                        </v-btn>
                         <v-btn
                           icon
                           @click="removeName(index)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </span>
                    </td>
                  </tr>
                </table>
              </v-container>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-container>
      <h3>Photos</h3>
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <Photo
            v-for="photo in respondent.photos"
            :height="250"
            :width="250"
            :key="photo.id"
            :photo="photo"/>
          <v-flex
            v-ripple
            class="photo add-photo">
            <v-btn @click="isAddingPhoto = true">
              <v-icon>add</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
      <h3>Locations</h3>
      <v-container fluid>
        <v-layout>
          <v-btn
            @click="addGeo()">Add location to respondent</v-btn>
        </v-layout>
        <v-data-table
          :headers="locationHeaders"
          :items="locations"
          hide-actions>
          <template slot="items" slot-scope="props">
            <td v-for="header in locationHeaders" :key="header.value">
              <GeoBreadcrumbs
                v-if="header.text === 'Name'"
               :geo-id="props.item.id" />
              <span v-else>
                {{props.item[header.value]}}
              </span>
            </td>
          </template>
        </v-data-table>
      </v-container>
      <h3>Condition Tags</h3>
      <v-data-table
        hide-actions
        :headers="[{
              text: 'Tag name',
              value: 'name'
            }, {
              text: 'Last updated',
              value: 'updated_at'
            }, {
              text: 'Created at',
              value: 'created_at'
            }]"
        :items="respondent.respondent_condition_tags">
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.updated_at }}</td>
          <td class="text-xs-right">{{ props.item.created_at }}</td>
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
      v-model="modal.geoSearch">
      <v-card>
        <GeoSearch
          @onGeoSelect="geoSelected"
          is-selectable />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import Photo from '../Photo'
  import GeoSearch from '../geo/GeoSearch'
  import RespondentName from './RespondentName'
  import RespondentService from '../../services/respondent/RespondentService'
  import TranslationService from '../../services/TranslationService'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import singleton from '../../static/singleton'

  let respondent
  function preloadRespondent (respondentId) {
    singleton.loading.active = true
    singleton.loading.indeterminate = true
    singleton.loading.message = 'Loading respondent...'
    return RespondentService.getRespondentById(respondentId).then(r => {
      respondent = r
      singleton.loading.active = false
    })
  }

  export default {
    name: 'respondent-info',
    data () {
      return {
        respondent: null,
        error: null,
        editing: {
          name: null,
          geo: null
        },
        modal: {
          editName: false,
          addName: false,
          geoSearch: false
        },
        isAddingPhoto: false,
        locationHeaders: [{
          text: 'Name',
          value: 'translated'
        }, {
          text: 'Type',
          value: 'type'
        }, {
          text: 'Current',
          value: 'isCurrent'
        }]
      }
    },
    beforeRouteEnter (to, from, next) {
      preloadRespondent(to.params.respondentId).then(next)
    },
    created () {
      this.respondent = respondent
    },
    methods: {
      photoFromCamera () {},
      photoFromFile () {},
      removeName (index) {
        let name = this.respondent.names[index]
        RespondentService.removeName(this.respondent.id, name.id).then(res => {
          this.respondent.names.splice(index, 1)
        }).catch(err => {
          this.error = err
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
      addGeo () {
        this.modal.geoSearch = true
        this.editing.geo = null
      },
      geoSelected (geo) {
        this.modal.geoSearch = false
        debugger
        if (this.editing.geo) {} else {}
      }
    },
    computed: {
      name () {
        let rName = this.respondent.names.find(n => n.is_display_name)
        return rName ? rName.name : this.respondent.name
      },
      locations () {
        return this.respondent.geos.map(geo => {
          geo.translated = TranslationService.getAny(geo.name_translation, this.global.locale.id)
          geo.type = geo.geo_type.name
          geo.isCurrent = geo.pivot.is_current
          return geo
        })
      }
    },
    components: {
      Photo,
      RespondentName,
      GeoSearch,
      GeoBreadcrumbs
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
