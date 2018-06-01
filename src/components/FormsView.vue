<template>
    <v-flex xs12 sm6 offset-sm3>
      <v-list>
        <v-list-tile
          v-for="form in cForms"
          :key="form.id"
          @click="startInterview(form)">
          <v-list-tile-action>
            <v-icon
              color="green darken-2"
              v-if="form.isComplete">check_circle</v-icon>
            <v-icon
              color="orange darken-2"
              v-if="form.isStarted">query_builder</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title >
              <TranslatedText
                :translation="form.name_translation"
                :locale="global.locale"/>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
</template>

<script>
  import TranslatedText from './TranslatedText'
  import InterviewService from '../services/interview/InterviewService'
  import SurveyService from '../services/survey/SurveyService'
  import router from '../router/router'
  export default {
    name: 'forms-view',
    props: {
      forms: {
        type: Array
      }
    },
    methods: {
      startInterview: function (form) {
        if (form.isComplete) return
        let p
        if (form.isStarted) {
          p = InterviewService.create(form.survey.id)
        } else {
          p = SurveyService.create(global.study.id, form.id).then(survey => {
            return InterviewService.create(survey.id)
          })
        }
        return p.then(interview => {
          router.push({name: 'Interview', params: {studyId: global.study.id, interviewId: interview.id}})
        }).catch(err => {
          this.error = err
        })
      }
    },
    computed: {
      cForms: function () {
        return this.forms.map(form => {
          form.isComplete = form.survey && form.survey.completed_at
          form.isStarted = form.survey && !form.survey.completed_at
          return form
        })
      }
    },
    components: {
      TranslatedText
    }
  }
</script>

<style scoped>

</style>
