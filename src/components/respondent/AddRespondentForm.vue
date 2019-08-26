<template>
  <v-container>
    <v-layout>
      <v-alert v-if="error">{{error}}</v-alert>
    </v-layout>
    <v-stepper v-model="step" vertical>

      <v-stepper-step step="1" :complete="step > 1">{{isAssociatedWithRespondent ? $t('add_other_respondent') : $t('add_respondent')}}</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text>
            <v-subheader>{{ $t('respondent_name_instructions') }}</v-subheader>
            <v-text-field
              required
              :label="$t('respondent_full_name')"
              :disabled="respondentExists"
              v-model="name"/>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="save">
              <v-progress-circular v-if="isSaving"/>
              <span v-else>{{$t('continue')}}</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step step="2" :complete="step > 2">{{$t('add_photos')}}</v-stepper-step>
      <v-stepper-content step="2">
        <v-card v-if="respondent">
          <v-card-text>
            <photo-album
              :title="$t('photos')"
              :photos="respondent.photos"
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

      <v-stepper-step step="3" :complete="step > 3">{{$t('census')}}</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text>
            <v-flex v-if="checkingForCensus">
              <v-progress-circular indeterminate />
              {{$t('checking_census_form')}}
            </v-flex>
            <v-flex v-else-if="hasCensusForm" >
              <v-icon color="success">check</v-icon>
              {{$t('census_form_found')}}
            </v-flex>
            <v-flex v-else>
              <v-icon color="error">clear</v-icon>
              {{$t('census_form_not_found')}}
            </v-flex>
          </v-card-text>
          <!--<v-card-actions>-->
            <!--<v-spacer></v-spacer>-->
            <!--<v-btn @click="step++" :disabled="checkingForCensus">-->
              <!--<v-progress-circular indeterminate v-if="checkingForCensus || hasCensusForm" />-->
              <!--<span v-else>{{$t('continue')}}</span>-->
            <!--</v-btn>-->
          <!--</v-card-actions>-->
        </v-card>
      </v-stepper-content>

    </v-stepper>
  </v-container>
</template>

<script>
  import RespondentService from '../../services/respondent/RespondentService'
  import CensusFormService from '../../services/census/index'
  import censusTypes from '../../static/census.types'
  import PhotoAlbum from '../photo/PhotoAlbum'
  import { routeQueue } from '../../router'
  export default {
    components: { PhotoAlbum },
    name: 'add-respondent-form',
    props: {
      associatedRespondentId: String,
      studyId: String,
      redirectToRespondentInfo: {
        type: Boolean,
        'default': true,
        required: false
      },
      onRespondentAdded: Function
    },
    computed: {
      isAssociatedWithRespondent () {
        return !!this.associatedRespondentId
      }
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
        respondent: null
      }
    },
    methods: {
      async addPhoto (photo) {
        try {
          let returnPhoto = await RespondentService.addPhoto(this.respondent.id, photo)
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
        let confirmMessage = this.$t('remove_photo_confirm') + ''
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
      async checkCensus () {
        const censusDelay = 1500
        this.step++
        this.checkingForCensus = true
        const censusTypeId = this.isAssociatedWithRespondent ? censusTypes.add_associated_respondent : censusTypes.add_respondent
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
                  respondentId: this.respondent.id
                },
                replace: true
              })
              routeQueue.unshift({
                name: 'StartCensusForm',
                params: {
                  studyId: this.studyId,
                  censusTypeId: censusTypeId
                },
                query: {
                  respondentId: this.respondent.id
                }
              })
            } else {
              routeQueue.replaceAndMerge({
                query: {
                  associatedRespondentId: this.associatedRespondentId,
                  associatedRespondentName: this.name
                }
              })
              routeQueue.unshift({
                name: 'StartCensusForm',
                params: {
                  studyId: this.studyId,
                  censusTypeId: censusTypeId
                },
                query: {
                  respondentId: this.respondent.id
                }
              })
            }
          }, censusDelay)
        } else {
          setTimeout(() => {
            this.$emit('close', this.respondent)
          }, censusDelay)
        }
      }
    }
  }
</script>

<style scoped>

</style>
