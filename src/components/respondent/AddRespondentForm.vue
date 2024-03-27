<template>
  <v-col>
    <v-row>
      <v-alert v-if="error">
        {{ error }}
      </v-alert>
    </v-row>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step
          step="1"
          :complete="step > 1"
        >
          {{
            isAssociatedWithRespondent
              ? $t('add_other_respondent')
              : $t('add_respondent')
          }}
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          step="2"
          :complete="step > 2"
        >
          {{
            $t('add_photos')
          }}
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          step="3"
          :complete="step > 3"
        >
          {{
            $t('census')
          }}
        </v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-subheader class="pa-1">
            {{ $t('respondent_name_instructions') }}
          </v-subheader>
          <v-text-field
            class="ma-1"
            required
            :label="$t('respondent_full_name')"
            :disabled="respondentExists"
            v-model="name"
          />
          <v-row
            no-gutters
            class="pa-1"
          >
            <v-btn
              :disabled="isSaving"
              :loading="isSaving"
              @click="save"
            >
              {{ $t('continue') }}
            </v-btn>
          </v-row>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-col v-if="respondent">
            <photo-album
              :title="$t('photos')"
              :photos="respondent.photos"
              @photo="addPhoto"
              @delete-photo="onDeletePhoto"
              @update-photos="onUpdatePhotos"
            />
            <v-row no-gutters>
              <v-btn @click="checkCensus">
                {{ $t('continue') }}
              </v-btn>
            </v-row>
            <v-spacer />
          </v-col>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-col>
            <v-col v-if="checkingForCensus">
              <v-progress-circular indeterminate />
              {{ $t('checking_census_form') }}
            </v-col>
            <v-col v-else-if="hasCensusForm">
              <v-icon color="success">
                mdi-check
              </v-icon>
              {{ $t('census_form_found') }}
            </v-col>
            <v-col v-else>
              <v-icon color="error">
                mdi-clear
              </v-icon>
              {{ $t('census_form_not_found') }}
            </v-col>
          </v-col>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import RespondentService from '../../services/respondent'
import CensusFormService from '../../services/census/index'
import censusTypes from '../../static/census.types'
import PhotoAlbum from '../photo/PhotoAlbum.vue'
import { routeQueue } from '../../router'
import { merge } from 'lodash'
import Respondent from '../../entities/trellis/Respondent'

export default Vue.extend({
  components: { PhotoAlbum },
  name: 'AddRespondentForm',
  props: {
    associatedRespondentId: String,
    studyId: String,
    redirectToRespondentInfo: {
      type: Boolean,
      default: true,
      required: false,
    },
    onRespondentAdded: Function,
  },
  computed: {
    isAssociatedWithRespondent (): boolean {
      return !!this.associatedRespondentId
    },
  },
  data () {
    return {
      step: 1,
      error: null,
      name: '',
      geoId: null,
      respondentExists: false,
      checkingForCensus: false,
      hasCensusForm: false,
      isSaving: false,
      respondent: null as Respondent | null,
    }
  },
  methods: {
    async addPhoto (photo) {
      try {
        const returnPhoto = await RespondentService.addPhoto(this.respondent.id, photo)
        this.respondent.photos.push(returnPhoto)
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    async onUpdatePhotos (photos) {
      try {
        await RespondentService.updatePhotos(photos)
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    async onDeletePhoto (photo) {
      const confirmMessage = this.$t('remove_photo_confirm') + ''
      if (!window.confirm(confirmMessage)) return
      try {
        await RespondentService.removePhoto(photo)
        this.respondent.photos.splice(this.respondent.photos.indexOf(photo), 1)
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    async save () {
      if (!this.name.length) return
      this.isSaving = true
      try {
        const respondent = await RespondentService.createRespondent(this.studyId, this.name, this.geoId, this.associatedRespondentId)
        this.respondentExists = true
        this.respondent = respondent
        this.step++
      } catch (err) {
        if (this.isNotAuthError(err)) {
          err.component = 'AddRespondentForm@save'
          this.logError(err)
        }
        this.step = 0
        this.respondent = null
      } finally {
        this.isSaving = false
      }
    },
    resetForm () {
      this.name = ''
      this.respondent = null
      this.step = 1
      this.respondentExists = false
      this.checkingForCensus = false
    },
    async checkCensus () {
      const censusDelay = 1500
      this.step++
      this.checkingForCensus = true
      const censusTypeId = this.isAssociatedWithRespondent ? censusTypes.add_associated_respondent : censusTypes.add_respondent
      try {
        this.hasCensusForm = await CensusFormService.hasCensusForm(this.studyId, censusTypeId)
        this.checkingForCensus = false
        if (this.hasCensusForm) {
          if (this.onRespondentAdded) {
            await this.onRespondentAdded(this.respondent.copy())
          }
          setTimeout(() => {
            if (this.redirectToRespondentInfo) {
              routeQueue.unshift({
                name: 'Respondent',
                params: {
                  studyId: this.studyId,
                  respondentId: this.respondent.id,
                },
                replace: true,
              })
              routeQueue.replace({
                name: 'StartCensusForm',
                params: {
                  studyId: this.studyId,
                  censusTypeId: censusTypeId,
                },
                query: {
                  respondentId: this.respondent.id,
                },
              })
            } else {
              const nextRoute = merge(routeQueue.currentRoute, {
                query: {
                  associatedRespondentId: this.associatedRespondentId,
                  associatedRespondentName: this.name,
                },
              })
              routeQueue.unshift(nextRoute)
              routeQueue.replace({
                name: 'StartCensusForm',
                params: {
                  studyId: this.studyId,
                  censusTypeId: censusTypeId,
                },
                query: {
                  respondentId: this.respondent.id,
                },
              })
            }
          }, censusDelay)
        } else {
          setTimeout(() => {
            this.$emit('close', this.respondent)
            this.resetForm()
          }, censusDelay)
        }
      } catch (err) {
        this.$emit('close', this.respondent)
        this.resetForm()
      }
    },
  },
})
</script>
