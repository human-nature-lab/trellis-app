<template>
  <v-flex xs12 sm12>
    <v-card>
      <RespondentsView :respondents="respondents" />
    </v-card>
  </v-flex>
</template>

<script>
  import RespondentsView from './RespondentsView'
  import respondentService from '../services/RespondentService'
  export default {
    name: 'respondents-search',
    data: function () {
      return {
        respondents: []
      }
    },
    components: {
      RespondentsView
    },
    mounted: function () {
      respondentService.getRespondents()
        .then(respondents => {
          this.respondents = respondents
        })
    }
  }
</script>

<style scoped>

</style>
