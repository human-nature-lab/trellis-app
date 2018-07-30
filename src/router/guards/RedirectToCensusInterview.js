import SurveyService from '../../services/survey/SurveyService'
import InterviewService from '../../services/interview/InterviewService'
import CensusService from '../../services/census'

export default function (to, from, next) {
  let form
  CensusService.getCensusForm(to.params.studyId, to.params.censusTypeId)
    .then(f => {
      form = f
      return SurveyService.getSurvey(to.params.studyId, to.query.respondentId, f.id)
    })
    .then(survey => {
      if (survey) {
        return survey
      } else {
        return SurveyService.create(to.params.studyId, to.query.respondentId, form.id)
      }
    })
    .then(survey => InterviewService.create(survey.id))
    .then(interview => {
      let queryTo = to.query.to
      next({
        name: 'Interview',
        params: {
          studyId: to.params.studyId,
          interviewId: interview.id
        },
        query: {
          to: queryTo
        }
      })
    })
    .catch(err => {
      console.error(err)
      next()
    })
}
