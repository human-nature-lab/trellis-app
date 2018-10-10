<template>
  <v-container>
    <v-layout>
      <v-alert v-if="error">{{error}}</v-alert>
    </v-layout>
    <v-stepper v-model="step" vertical>

      <v-stepper-step step="1" :complete="step > 1">{{$t('add_respondent')}}</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text>
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
            <PhotoAlbum
              :title="$t('add_photos')"
              :photos="respondent.photos"
              @photo="addPhoto"/>
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
            <v-progress-circular indeterminate v-if="checkingForCensus" />
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
  import RespondentService from '../../services/respondent/RespondentService'
  import CensusFormService from '../../services/census/index'
  import censusTypes from '../../static/census.types'
  import PhotoAlbum from '../photo/PhotoAlbum'
  import {pushRouteAndQueueCurrent} from '../../router'
  export default {
    components: {PhotoAlbum},
    name: 'add-respondent-form',
    props: {
      associatedRespondentId: String,
      studyId: String
    },
    data () {
      return {
        step: 1,
        error: null,
        name: '',
        geoId: null,
        respondentExists: false,
        checkingForCensus: false,
        isSaving: false,
        respondent: null
      }
    },
    methods: {
      async addPhoto (photo) {
        await RespondentService.addPhoto(this.respondent.id, photo)
        this.respondent.photos.push(photo)
      },
      async save () {
        if (!this.name.length) return
        this.isSaving = true
        try {
          const respondent = await RespondentService.createRespondent(this.studyId, this.name, this.geoId, this.associatedRespondentId)
          // respondent.photos = []
          this.respondentExists = true
          this.respondent = respondent
        } catch (err) {
          debugger
          this.error = err
        } finally {
          this.isSaving = false
          this.step++
        }
      },
      async checkCensus () {
        this.step++
        this.checkingForCensus = true
        const censusTypeId = this.associatedRespondentId ? censusTypes.add_associated_respondent : censusTypes.add_respondent
        const hasCensus = await CensusFormService.hasCensusForm(this.studyId, censusTypeId)
        if (hasCensus) {
          pushRouteAndQueueCurrent({
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
          this.checkingForCensus = false
          console.log('no census form found')
          setTimeout(() => {
            this.$emit('close', this.respondent)
          }, 1500)
        }
      }
    }
  }
</script>

<style scoped>

</style>
