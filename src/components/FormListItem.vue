<template>
  <v-card class="ma-1">
    <v-layout
      column
      :id="'form-' + form.id"
      :class="{'open': isOpen}">
      <v-layout
        row>
        <v-flex class="centered icon-container clickable" @click="tryCreatingSurvey">
          <v-tooltip
            right
            v-if="form.isComplete">
            <v-icon
              slot="activator"
              color="green darken-2">check_circle</v-icon>
            <span>
              {{ $t('completed') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else-if="form.isStarted">
            <v-icon
              slot="activator"
              color="orange darken-2">query_builder</v-icon>
            <span>
              {{ $t('in_progress') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else>
            <v-icon slot="activator">
              play_circle_outline
            </v-icon>
            <span>
              {{ $t('not_started') }}
            </span>
          </v-tooltip>
        </v-flex>
        <v-flex
          class="centered clickable"
          @click="$emit('click')">
          <AsyncTranslationText
            :translation="form.nameTranslation">
          </AsyncTranslationText>
        </v-flex>
        <v-spacer />
        <v-flex class="icon-container">
          <v-btn
            :disabled="!form.surveys.length"
            icon
            @click="isOpen = !isOpen">
            <v-icon v-if="!isOpen">keyboard_arrow_down</v-icon>
            <v-icon v-else>keyboard_arrow_up</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout
        column
        class="ml-5"
        v-if="isOpen">
        <v-flex>
          <table class="table">
            <thead>
              <tr>
                <th>Status</th>
                <th class="a-left">
                  {{ $t('interviews') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="survey in form.surveys"
                :data-survey-id="survey.id"
                :key="survey.id"
                @click="tryStartingSurvey(survey)">
                <td>
                  <span
                    v-if="survey.completedAt"
                    class="complete">
                    {{ $t('completed') }}
                  </span>
                  <span
                    v-else
                    class="incomplete">
                    {{ $t('in_progress') }}
                  </span>
                </td>
                <td>
                  <table class="table">
                    <tr>
                      <th>{{ $t('surveyor') }}</th>
                      <th>{{ $t('start_time') }}</th>
                      <th>{{ $t('end_time') }}</th>
                    </tr>
                    <tr
                      v-for="interview in survey.interviews"
                      :data-interview-id="interview.id"
                      :key="interview.id">
                      <td>{{getName(interview.user)}} <span class="light">({{getUsername(interview.user)}})</span></td>
                      <td>{{interview.startTime && interview.startTime.local().format('llll')}}</td>
                      <td>{{interview.endTime && interview.endTime.local().format('llll')}}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-card>
</template>

<script>
  // @ts-ignore
  import AsyncTranslationText from './AsyncTranslationText.vue'

  import Vue from 'vue'
  import global from '../static/singleton'
  import SurveyService from "../services/survey"
  import InterviewService from "../services/interview/InterviewService"
  import {getCurrentPosition} from './LocationFinder'
  import {defaultLoggingService as logger} from '../services/logging/LoggingService'

  '../services/logging/LoggingService'

  export default Vue.extend({
    name: 'form-list-item',
    props: {
      respondent: {
        type: Object,
        required: true
      },
      form: {
        type: Object,
        required: true
      },
      allowMultipleSurveys: {
        type: Boolean,
        required: true
      },
      canCreateSurveys: {
        type: Boolean,
        required: true
      }
    },
    data () {
      return {
        global: global,
        isOpen: false
      }
    },
    computed: {
      isComplete () {
        return this.form.isComplete
      },
      isStarted () {
        return this.form.isStarted
      },
      nSurveys () {
        return this.form.surveys.length
      }
    },
    methods: {
      getName (user) {
        return user ? user.name : this.$t('unknown_user')
      },
      getUsername (user) {
        return user ? user.username : ''
      },
      async tryCreatingSurvey () {
        if (!this.canCreateSurveys){
          // Do nothing
          alert(this.$t('cant_start_form'))
        } else if (this.form.surveys.length !== 0 && !this.allowMultipleSurveys) {
          alert(this.$t('cant_create_survey'))
        } else if (this.form.surveys.length === 0 || confirm(this.$t('create_another_survey'))) {
          this.global.loading.active = true
          // Start a new survey
          let survey
          try {
            survey = await SurveyService.create(this.global.study.id, this.respondent.id, this.form.id)
          } catch (err) {
            err.component = 'FormListItem'
            logger.log(err)
            alert(this.$t('create_survey_failed', [err]))
          }
          if (survey) {
            this.tryStartingSurvey(survey)
          }
          this.global.loading.active = false
        }
      },
      async tryStartingSurvey (survey) {
        // TODO: Log errors in db
        let coords, interview
        if (survey.completedAt) {
          alert(this.$t('cant_resume_survey'))
        } else {
          try {
            coords = await getCurrentPosition()
          } catch (err) {
            err.component('FormListItem')
            logger.log(err)
            console.error(err)
            alert(this.$t('gps_error', [err]))
          }
          try {
            interview = await InterviewService.create(survey.id, coords)
            this.$emit('newInterview', interview)
          } catch (err) {
            console.error(err)
            alert(this.$t('create_interview_failed', [err]))
          }
        }
      }
    },
    components: {
      AsyncTranslationText
    }
  })
</script>

<style lang="sass" scoped>
  table
    &.striped
      >tbody
        >tr:nth-child(2n)
          background: #f5f5f5
    thead
      th
        border-bottom: 1px solid grey
    width: 100%
    td, th
      text-align: right
      &:first-child
        text-align: left
    .a-left
      text-align: left
  .icon-container
    width: 50px
    padding: 5px
    flex-grow: 0
    flex-shrink: 0
  /*.open*/
    /*border-top: 1px solid lightgrey*/
    /*border-bottom: 1px solid lightgrey*/
  .light
    color: grey
  .clickable
    cursor: pointer
  .complete
    color: green
  .incomplete
    color: orangered
  .centered
    display: inline-flex
    align-items: center

</style>
