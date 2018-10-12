<template>
    <div>{{ $t('loading')}}</div>
</template>

<script>
  import RouteMixinFactory from '../mixins/RoutePreloadMixin'
  import CensusService from '../services/census/index'
  import SurveyService from '../services/survey'
  import InterviewService from '../services/interview/InterviewService'
  import router from '../router'
  function setup (to) {
    let res = {
      studyId: to.params.studyId
    }
    return CensusService.getCensusForm(to.params.studyId, to.params.censusTypeId)
      .then(f => {
        res.form = f
        return SurveyService.getSurvey(to.params.studyId, to.query.respondentId, f.id)
      })
      .then(survey => {
        if (survey) {
          return survey
        } else {
          return SurveyService.create(to.params.studyId, to.query.respondentId, res.form.id)
        }
      })
      .then(survey => InterviewService.create(survey.id))
      .then(interview => {
        res.interview = interview
        res.queryTo = to.query.to
        return res
      })
  }
  export default {
    name: 'CensusFormLoaderPage',
    mixins: [RouteMixinFactory(setup)],
    methods: {
      // We are misusing the hydrate method to redirect to the interview here
      hydrate (data) {
        router.replace({
          name: 'Interview',
          params: {
            studyId: data.studyId,
            interviewId: data.interview.id
          },
          query: {
            to: data.queryTo
          }
        })
      }
    }
  }
</script>
