<template>
  <v-dialog
    v-model="adding"
    :persistent="true">
    <v-card>
      <v-card-title>
        <h2>{{ $t('add_location') }}</h2>
        <v-spacer></v-spacer>
        <v-btn
          icon
          flat
          style="top: 0"
          @click="closeDialog(null)">
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="step" vertical>

          <v-stepper-step step="1" :complete="step > 1">{{$t('add_location')}}</v-stepper-step>
          <v-stepper-content step="1">
            <v-card>
              <v-card-text>
                <translation-text-field
                  v-if="geo !== null"
                  :persist="false"
                  :translation="geo.nameTranslation"
                  v-on:editing-cancelled="closeDialog(null)"
                  v-on:editing-done="onEditingDone">
                </translation-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!addLocationCompleted"
                  @click="nextStep">
                  {{$t('continue')}}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-step step="2" :complete="step > 2">{{$t('select_location_type')}}</v-stepper-step>
          <v-stepper-content step="2">
            <v-card>
              <v-card-text>
                <geo-type-selector
                  :show-user-addable="true"
                  v-on:geo-type-selected="onGeoTypeSelected">
                </geo-type-selector>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!locationTypeSelected"
                  @click="nextStep">
                  {{$t('continue')}}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-step step="3" :complete="step > 3">{{$t('position_location')}}</v-stepper-step>
          <v-stepper-content step="3">
            <v-card>
              <v-card-title class="subheading">{{ $t('current_position') }}</v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-tile>
                    <v-list-tile-content>{{ $t('latitude') }}</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ latitude }}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>{{ $t('longitude') }}</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ longitude }}</v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile>
                    <v-list-tile-content>{{ $t('altitude') }}</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ altitude }}</v-list-tile-content>
                  </v-list-tile>
                </v-list>
                <v-btn @click="getPosition">{{$t('use_current_position')}}</v-btn>
                <v-btn v-if="this.parentGeoId !== null" @click="useParentPosition">{{$t('use_parent_position')}}</v-btn>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="onPositioningDone"
                  :disabled="!positionSet">
                  {{$t('continue')}}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-step step="4" :complete="step > 4">{{$t('add_photos')}}</v-stepper-step>
          <v-stepper-content step="4">
            <v-card v-if="geo">
              <v-card-text>
                <photo-album
                  :title="$t('add_photos')"
                  :photos="geo.photos"
                  @photo="addPhoto">
                </photo-album>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="checkCensus">{{$t('continue')}}</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-step step="5" :complete="step > 5">{{$t('census')}}</v-stepper-step>
          <v-stepper-content step="5">
            <v-card>
              <v-card-text>
                <v-progress-circular indeterminate v-if="checkingForCensus"></v-progress-circular>
                <v-icon v-else color="success">check</v-icon>
                {{$t('checking_census_form')}}
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!isDone"
                  @click="done">
                  {{$t('done')}}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import StudyService from '../../services/study/StudyService'
  import GeoService from '../../services/geo/GeoService'
  import CensusFormService from '../../services/census/index'
  import censusTypes from '../../static/census.types'
  import PhotoAlbum from '../photo/PhotoAlbum'
  import TranslationTextField from '../TranslationTextField.vue'
  import GeoTypeSelector from './GeoTypeSelector.vue'
  import { pushRouteAndQueueCurrent } from '../../router'
  import { getCurrentPosition } from '../LocationFinder'
  import isNumber from 'lodash/isNumber'

  export default {
    components: {
      PhotoAlbum,
      TranslationTextField,
      GeoTypeSelector
    },
    name: 'add-geo-form',
    props: {
      parentGeoId: {
        type: String
      },
      adding: {
        type: Boolean,
        'default': false
      }
    },
    data () {
      return {
        step: 1,
        addLocationCompleted: false,
        locationTypeSelected: false,
        isSaving: false,
        geo: null,
        checkingForCensus: false,
        isDone: false
      }
    },
    async created () {
      try {
        const study = await StudyService.getCurrentStudy()
      } catch (err) {
        this.log(err)
        this.alert('error', 'Could not get current study', {timeout: 0})
      }
      this.geo = GeoService.createNewGeo(this.parentGeoId, study.locales)
    },
    computed: {
      latitude () {
        return (this.geo && this.geo.hasOwnProperty('latitude') && isNumber(this.geo.latitude)) ? this.geo.latitude : this.$t('none')
      },
      longitude () {
        return (this.geo && this.geo.hasOwnProperty('longitude') && isNumber(this.geo.longitude)) ? this.geo.longitude : this.$t('none')
      },
      altitude () {
        return (this.geo && this.geo.hasOwnProperty('altitude') && isNumber(this.geo.altitude)) ? this.geo.altitude : this.$t('none')
      },
      positionSet () {
        return (isNumber(this.latitude) && isNumber(this.longitude))
      }
    },
    methods: {
      nextStep () {
        this.step++
      },
      async onEditingDone () {
        this.addLocationCompleted = true
      },
      onGeoTypeSelected (geoType) {
        this.geo.geoType = geoType
        this.locationTypeSelected = true
      },
      async getPosition () {
        try {
          let coords = await getCurrentPosition()
          this.geo.latitude = coords.latitude
          this.geo.longitude = coords.longitude
          this.geo.altitude = coords.altitude
        } catch (err) {
          this.log(err)
          this.alert('error', 'Could not get current position', {timeout: 0})
        }
      },
      async useParentPosition () {
        const parentGeo = await GeoService.getGeoById(this.parentGeoId)
        this.geo.latitude = parentGeo.latitude
        this.geo.longitude = parentGeo.longitude
        this.geo.altitude = parentGeo.altitude
      },
      async onPositioningDone () {
        try {
          await GeoService.createGeo(this.geo)
        } catch (err) {
          this.log(err)
          this.alert('error', `Could not create new geo`, {timeout: 0})
        }
        this.step++
      },
      async addPhoto (photo) {
        await GeoService.addPhoto(this.geo.id, photo)
        this.geo.photos.push(photo)
      },
      done () {
        this.closeDialog(this.geo)
      },
      closeDialog (geo) {
        this.step = 1
        this.error = null
        this.isSaving = false
        this.checkingForCensus = false
        this.addLocationCompleted = false
        this.locationTypeSelected = false
        this.$emit('close', geo)
      },
      async checkCensus () {
        this.step++
        this.checkingForCensus = true
        const hasCensus = await CensusFormService.hasCensusForm(this.studyId, censusTypes.add_geo)
        if (hasCensus) {
          pushRouteAndQueueCurrent({
            name: 'StartCensusForm',
            params: {
              studyId: this.studyId,
              censusTypeId: censusTypes.add_geo
            },
            query: {
              geoId: this.geo.id
            }
          })
        } else {
          this.checkingForCensus = false
          this.isDone = true
        }
      }
    }
  }
</script>

<style scoped>

</style>
