<template>
  <v-container
    fill-width
    class="ma-1"
  >
    <v-col
      :id="'form-' + form.id"
      class="w-full"
      :class="{'open': isOpen}"
    >
      <v-row
        no-gutters
        class="clickable align-content-center fill-width"
        @click="$emit('click')"
      >
        <v-col
          class="icon-container clickable flex-grow-0 mr-4"
          @click="tryCreatingSurvey"
        >
          <v-icon
            @click.stop="tryCreatingSurvey"
            :color="status.color"
          >
            {{ status.icon }}
          </v-icon>
          <v-tooltip>
            <span>
              {{ form.isStarted ? $t('not_started') : $t('in_progress') }}
            </span>
          </v-tooltip>
        </v-col>
        <AsyncTranslationText
          :translation="form.nameTranslation"
        />
        <span class="version">
          (v{{ form.version }})
        </span>
        <v-spacer />
        <v-chip
          v-if="status.msg"
          outlined
          label
          :color="status.color"
        >
          {{ status.msg }}
        </v-chip>
        <v-col class="icon-container">
          <v-btn
            :disabled="!form.surveys.length"
            icon
            @click="isOpen = !isOpen"
          >
            <v-icon v-if="!isOpen">
              mdi-chevron-down
            </v-icon>
            <v-icon v-else>
              mdi-chevron-up
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        class="ml-12"
        v-if="isOpen"
      >
        <v-flex>
          <v-simple-table>
            <thead>
              <tr>
                <th>{{ $t('interview_status') }}</th>
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
                @click="tryStartingSurvey(survey)"
                class="clickable"
              >
                <td>
                  <span
                    v-if="survey.completedAt"
                    class="complete"
                  >
                    {{ $t('completed') }}
                  </span>
                  <span
                    v-else
                    class="incomplete"
                  >
                    {{ $t('in_progress') }}
                  </span>
                </td>
                <td>
                  <table class="table">
                    <tr>
                      <th>{{ $t('surveyor') }}</th>
                      <th>{{ $t('version') }}</th>
                      <th>{{ $t('start_time') }}</th>
                      <th>{{ $t('duration') }}</th>
                    </tr>
                    <tr
                      v-for="interview in survey.interviews"
                      :data-interview-id="interview.id"
                      :key="interview.id"
                    >
                      <td>
                        {{ getName(interview.user) }} <span class="light">({{ getUsername(interview.user) }})</span>
                      </td>
                      <td>{{ survey.form.version }}</td>
                      <td>
                        <span
                          v-if="interview.startTime"
                          :title="interview.startTime.local().format('llll')"
                        >
                          {{ interview.startTime.local().fromNow() }}
                        </span>
                      </td>
                      <td>
                        <span
                          v-if="interview.startTime && interview.endTime">
                          {{ dateDiff(interview.startTime, interview.endTime) }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-flex>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import AsyncTranslationText from '../AsyncTranslationText.vue'

import Vue, { PropOptions } from 'vue'
import global from '@/static/singleton'
import SurveyService from '@/services/survey'
import InterviewService from '@/services/interview'
import { getCurrentPosition } from '../LocationFinder.vue'
import singleton from '@/static/singleton'
import Survey from '@/entities/trellis/Survey'
import Translation from '@/entities/trellis/Translation'
import moment, { Moment } from 'moment'

export type DisplayForm = {
  isComplete?: boolean
  isStarted?: boolean
  nComplete?: number
  id: string
  nameTranslation: Translation
  surveys: Survey[]
  isPublished: boolean
  isSkipped: boolean
  censusTypeId: string
  version: number
}

export default Vue.extend({
  name: 'FormListItem',
  props: {
    respondent: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      required: true,
    } as PropOptions<DisplayForm>,
    allowMultipleSurveys: {
      type: Boolean,
      required: true,
    },
    canCreateSurveys: {
      type: Boolean,
      required: true,
    },
  },
  data () {
    return {
      global: global,
      isOpen: false,
      previousInterviewCoordinatesTolerance: 24 * 60 * 60 * 1000,
    }
  },
  computed: {
    isComplete (): boolean {
      return this.form.isComplete
    },
    isStarted (): boolean {
      return this.form.isStarted
    },
    nSurveys (): number {
      return this.form.surveys.length
    },
    status (): { msg: string, icon: string, color: string } {
      if (this.form.isComplete) {
        return {
          msg: this.$t('completed').toString(),
          icon: 'mdi-check-circle',
          color: 'green darken-2',
        }
      } else if (this.form.isStarted) {
        return {
          msg: this.$t('in_progress').toString(),
          icon: 'mdi-play-circle-outline',
          color: 'orange darken-2',
        }
      }
      return {
        msg: '',
        icon: 'mdi-play-circle-outline',
        color: '',
      }
    },
  },
  methods: {
    getName (user) {
      return user ? user.name : this.$t('unknown_user')
    },
    getUsername (user) {
      return user ? user.username : ''
    },
    dateDiff (startTime: Moment, endTime: Moment): string {
      return moment.duration(endTime.diff(startTime)).humanize()
    },
    async tryCreatingSurvey () {
      const currentVersionSurveys = this.form.surveys.filter(s => s.formId === this.form.id)
      if (!this.canCreateSurveys) {
        // Do nothing
        this.alert('error', this.$t('cant_start_form'), { timeout: 0 })
      } else if (currentVersionSurveys.length !== 0 && !this.allowMultipleSurveys) {
        this.alert('error', this.$t('cant_create_survey'), { timeout: 0 })
      } else if (currentVersionSurveys.length === 0 || confirm(this.$t('create_another_survey').toString())) {
        this.alert('success', this.$t('starting_survey'))
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
        // this.global.loading.active = false
      }
    },
    async tryStartingSurvey (survey: Survey) {
      let coords, interview
      if (survey.completedAt) {
        this.alert('error', this.$t('cant_resume_survey'))
      } else if (survey.formId !== this.form.id) {
        this.alert('error', this.$t('outdated_survey'))
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
    },
  },
  components: {
    AsyncTranslationText,
  },
})
</script>

<style lang="sass" scoped>
  .version
    margin-left: 10px
    font-size: 14px
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
