<template>
  <v-container>
    <v-layout>
      <v-alert v-if="error">{{error}}</v-alert>
    </v-layout>
    <v-stepper v-model="step" vertical>

      <v-stepper-step step="1" :complete="step > 1">{{$t('add_location')}}</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text>
            <translation-text-field
              v-if="geo !== null"
              :persist="false"
              :translation="geo.nameTranslation"
              v-on:editing-cancelled="onEditingCancelled"
              v-on:editing-done="onEditingDone">
            </translation-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="!geoCreated"
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
              :disabled="!geoTypeSelected"
              @click="nextStep">
              {{$t('continue')}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step step="3" :complete="step > 3">{{$t('position_location')}}</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text>
            How do you want to position this location?
            <v-btn>{{$t('use_your_current_location')}}</v-btn>
            <v-btn>{{$t('use_parent_location')}}</v-btn>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="onPositioningDone">
              <v-progress-circular v-if="isSaving"></v-progress-circular>
              <span v-else>{{$t('continue')}}</span>
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
            <v-btn @click="step++">{{$t('continue')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

    </v-stepper>
  </v-container>
</template>

<script>
  import StudyService from '../../services/study/StudyService'
  import GeoService from '../../services/geo/GeoService'
  import CensusFormService from '../../services/census/index'
  import censusTypes from '../../static/census.types'
  import PhotoAlbum from '../photo/PhotoAlbum'
  import TranslationTextField from '../TranslationTextField.vue'
  import GeoTypeSelector from './GeoTypeSelector.vue'
  import {pushRouteAndQueueCurrent} from '../../router'
  export default {
    components: {
      PhotoAlbum,
      TranslationTextField,
      GeoTypeSelector
    },
    name: 'add-geo-form',
    props: {
      parentGeoId: {
        type: String,
        'default': null
      }
    },
    data () {
      return {
        step: 1,
        error: null,
        name: '',
        geoId: null,
        isSaving: false,
        geo: null,
        checkingForCensus: false,
        geoCreated: false,
        geoTypeSelected: false
      }
    },
    async created () {
      const study = await StudyService.getCurrentStudy()
      this.geo = GeoService.createNewGeo(this.parentGeoId, study.locales)
      console.log('created', this.geo)
    },
    methods: {
      nextStep () {
        this.step++
      },
      async onEditingDone () {
        console.log('onEditingDone', this.geo)
        try {
          //await GeoService.createGeo(this.geo)
          this.geoCreated = true
        } catch (err) {
          this.error = err
        }
      },
      onEditingCancelled () {
        console.log('onEditingCancelled')
        this.geo = null
        this.$emit('close', null)
      },
      onGeoTypeSelected (geoType) {
        this.geo.geoType = geoType
        this.geoTypeSelected = true
        console.log('onGeoTypeSelected', this.geo)
      },
      onPositioningDone () {
        // TODO
        console.log('onPositioningDone', this.geo)
        this.step++
      },
      async addPhoto (photo) {
        await GeoService.addPhoto(this.geo.id, photo)
        this.geo.photos.push(photo)
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
          console.log('no census form found')
          setTimeout(() => {
            this.$emit('close', this.geo)
          }, 1500)
        }
      }
    }
  }
</script>

<style scoped>

</style>
