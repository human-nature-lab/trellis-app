<template>
    <div>{{ $t('loading')}}</div>
</template>

<script>
  import RouteMixinFactory from '../mixins/RoutePreloadMixin'
  import CensusService from '../services/census/index'
  import SurveyService from '../services/survey'
  import InterviewService from '../services/interview'
  import { routeQueue } from '../router'
  function setup (to) {
    let res = {
      studyId: to.params.studyId
    }
    return CensusService.getCensusForm(to.params.studyId, to.params.censusTypeId)
      .then(f => {
        res.form = f
        return SurveyService.create(to.params.studyId, to.query.respondentId, res.form.id)
      })
      .then(survey => InterviewService.create(survey.id))
      .then(interview => {
        res.interview = interview
        return res
      })
  }
  export default {
    name: 'CensusFormLoaderPage',
    mixins: [RouteMixinFactory(setup)],
    methods: {
      // We are misusing the hydrate method to redirect to the interview here
      hydrate (data) {
        routeQueue.replace({
          name: 'Interview',
          params: {
            studyId: data.studyId,
            interviewId: data.interview.id
          }
        })
      }
    }
  }
</script>
