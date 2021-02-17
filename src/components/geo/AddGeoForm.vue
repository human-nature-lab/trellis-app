<template>
  <TrellisModal
    :title="$t('add_location')"
    :value="adding"
    :persistent="true"
    @opened="onOpen"
    @close="done">
    <v-card>
      <v-card-text>

        <v-stepper v-model="step" vertical>
          <v-stepper-step step="1" :complete="step > 1">{{$t('location_name')}}</v-stepper-step>
          <v-stepper-content step="1">
            <v-card>
              <v-card-text>
                <translation-text-field
                  v-if="step === 1 && this.geo.nameTranslation !== null"
                  :persist="false"
                  :editing="true"
                  :translation="geo.nameTranslation"
                  @cancelled="closeDialog(null)"
                  @save="onNameSave">
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
                <geo-type-select
                  :showUserAddable="true"
                  @geoTypeSelected="onGeoTypeSelected">
                </geo-type-select>
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
                <v-text-field
                  v-model="geo.latitude"
                  type="number"
                  :label="$t('latitude')"
                />
                <v-text-field
                  v-model="geo.longitude"
                  type="number"
                  :label="$t('longitude')"
                />
                <v-text-field
                  v-model="geo.altitude"
                  type="number"
                  :label="$t('altitude')"
                />
                <v-btn @click="getPosition" class="mr-2">{{$t('use_current_position')}}</v-btn>
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
            <v-card>
              <v-card-text>
                <photo-album
                  :title="$t('add_photos')"
                  :photos="geo.photos"
                  @photo="addPhoto"
                  @delete-photo="onDeletePhoto"
                  @update-photos="onUpdatePhotos"></photo-album>
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
                <v-icon v-else color="success">mdi-check</v-icon>
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
  </TrellisModal>
</template>

<script>
  import StudyService from '../../services/study/StudyService'
  import GeoService from '../../services/geo/GeoService'
  import CensusFormService from '../../services/census/index'
  import censusTypes from '../../static/census.types'
  import PhotoAlbum from '../photo/PhotoAlbum'
  import TranslationTextField from '../TranslationTextField.vue'
  import GeoTypeSelect from './GeoTypeSelect.vue'
  import { routeQueue } from '../../router'
  import { getCurrentPosition } from '../LocationFinder'
  import global from '../../static/singleton'
  import TrellisModal from '../TrellisModal'

  export default {
    components: {
      PhotoAlbum,
      TranslationTextField,
      GeoTypeSelect,
      TrellisModal
    },
    name: 'add-geo-form',
    props: {
      parentGeoId: {
        type: String | null
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
        geo: {
          id: null,
          latitude: null,
          longitude: null,
          altitude: null,
          nameTranslation: null,
          geoType: null,
          photos: []
        },
        checkingForCensus: false,
        isDone: false,
        loading: false
      }
    },
    computed: {
      positionSet () {
        return (!!this.geo.latitude && !!this.geo.longitude)
      }
    },
    methods: {
      async onOpen () {
        try {
          this.loading = true
          const study = await StudyService.getCurrentStudy()
          this.geo = GeoService.createNewGeo(this.parentGeoId, study.locales)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Could not get current study')
          }
        } finally {
          this.loading = false
        }
      },
      nextStep () {
        this.step++
      },
      async onNameSave (newTranslation) {
        this.geo.nameTranslation = newTranslation
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
          this.logError(err, 'Could not get current position')
        }
      },
      async useParentPosition () {
        try {
          const parentGeo = await GeoService.getGeoById(this.parentGeoId)
          this.geo.latitude = parentGeo.latitude
          this.geo.longitude = parentGeo.longitude
          this.geo.altitude = parentGeo.altitude
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async onPositioningDone () {
        try {
          this.geo = await GeoService.createGeo(this.geo)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
        this.step++
      },
      async addPhoto (photo) {
        try {
          let returnPhoto = await GeoService.addPhoto(this.geo.id, photo)
          this.geo.photos.push(returnPhoto)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async onUpdatePhotos (photos) {
        try {
          await GeoService.updatePhotos(photos)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      async onDeletePhoto (photo) {
        let confirmMessage = this.$t('remove_photo_confirm') + ''
        if (!window.confirm(confirmMessage)) return
        try {
          await GeoService.removePhoto(photo)
          this.geo.photos.splice(this.geo.photos.indexOf(photo), 1)
        } catch (err) {
          console.error(err)
        }
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
        const hasCensus = await CensusFormService.hasCensusForm(global.study.id, censusTypes.add_geo)
        if (hasCensus) {
          routeQueue.push({
            name: 'StartCensusForm',
            params: {
              studyId: global.study.id,
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
