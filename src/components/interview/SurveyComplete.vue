<template>
    <v-container fluid grid-list-xl>
      <v-layout row justify-center>
        <div>
          <h3>This survey is complete.</h3>
          <v-btn @click="toRespondentForms">Respondent Forms</v-btn>
        </div>
      </v-layout>
    </v-container>
</template>

<script>
  import routeQueue from '../../router'
  import SurveyService from '../../services/survey/'
  export default {
    name: 'SurveyComplete',
    methods: {
      async toRespondentForms () {
        const survey = await SurveyService.getSurveyById(this.$route.params.surveyId)
        routeQueue.replace({
          name: 'RespondentForms',
          params: {
            studyId: survey.studyId,
            respondentId: survey.respondentId
          }
        })
      }
    }
  }
</script>
