<template>
  <v-container class="ma-1">
    <v-col
      :id="'form-' + form.id"
      :class="{'open': isOpen}">
      <v-row>
        <v-flex class="centered icon-container clickable" @click="tryCreatingSurvey">
          <v-tooltip
            right
            v-if="form.isComplete">
            <template #activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="green darken-2">mdi-check-circle</v-icon>
            </template>
            <span>
              {{ $t('completed') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else-if="form.isStarted">
            <template #activator="{ on, attrs }">
              <v-icon
                v-on="on"
                v-bind="attrs"
                color="orange darken-2">mdi-clock-outline</v-icon>
            </template>
            <span>
              {{ $t('in_progress') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else>
            <template #activator="{ on, attrs }">
              <v-icon
                @click="tryCreatingSurvey"
                v-on="on"
                v-bind="attrs">
                mdi-play-circle-outline
              </v-icon>
            </template>
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
            <v-icon v-if="!isOpen">mdi-chevron-down</v-icon>
            <v-icon v-else>mdi-chevron-up</v-icon>
          </v-btn>
        </v-flex>
      </v-row>
      <v-row
        class="ml-12"
        v-if="isOpen">
        <v-flex>
          <table class="table">
            <thead>
              <tr>
                <th>{{$t('interview_status')}}</th>
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
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText.vue'

  import Vue from 'vue'
  import global from '../../static/singleton'
  import SurveyService from '../../services/survey'
  import InterviewService from '../../services/interview/InterviewService'
  import { getCurrentPosition } from '../LocationFinder'
  import singleton from '../../static/singleton'

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
        isOpen: false,
        previousInterviewCoordinatesTolerance: 24 * 60 * 60 * 1000
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
          singleton.loading.indeterminate = true
          singleton.loading.active = true
          singleton.loading.fullscreen = true
          // Start a new survey
          let survey
          try {
            survey = await SurveyService.create(this.global.study.id, this.respondent.id, this.form.id)
          } catch (err) {
            if (this.isNotAuthError(err)) {
              err.component = 'FormListItem.vue@tryCreatingSurvey'
              this.logError(err, this.$t('create_survey_failed', [err.message]))
            }
          }
          if (survey) {
            this.tryStartingSurvey(survey)
          } else {
            alert('unable to start survey')
          }
          //this.global.loading.active = false
        }
      },
      async tryStartingSurvey (survey) {
        let coords, interview
        if (survey.completedAt) {
          alert(this.$t('cant_resume_survey'))
        } else {
          try {
            coords = await InterviewService.getLatestInterviewPosition(survey.respondentId, this.previousInterviewCoordinatesTolerance)
          } catch (err) {
            console.log('no previous interview matching this tolerance found')
            try {
              coords = await getCurrentPosition()
            } catch (err2) {
              err2.component = 'FormListItem.vue@tryStartingSurvey'
              this.logError(err)
              this.logError(err2)
              alert(this.$t('gps_error', [err2]))
            }
          }
          try {
            interview = await InterviewService.create(survey.id, coords)
            this.$emit('newInterview', interview)
          } catch (err) {
            err.component = 'FormListItem.vue@tryStartingSurvey'
            this.logError(err)
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
