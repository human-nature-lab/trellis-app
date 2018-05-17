import InterviewService from '../../components/interview/services/interview/InterviewService'
import InterviewActionsService from '../../components/interview/services/interview-actions/InterviewActionsService'
import FormService from '../../services/form/FormService'
import singleton from '../../singleton'

export default function loadInterview (to, from, next) {
  let interview = null
  InterviewService.getInterview(to.params.interviewId)
    .catch(err => {
      console.error('No interview exists with this id')
      throw err
    })
    .then(inter => {
      interview = inter
      return Promise.all([
        InterviewActionsService.getActions(to.params.interviewId).catch(err => {
          console.error('interview actions route does not work', err)
          return []
        }),
        InterviewService.getData(to.params.interviewId).catch(err => {
          console.error('interview data service does not work', err)
          return []
        }),
        FormService.getForm(interview.survey.form_id),
        InterviewService.getPreload(to.params.interviewId).catch(err => {
          console.error('preload data was not loaded', err)
          return []
        })
      ]).then(results => {
        let [actions, data, formBlueprint, preload] = results
        singleton.interview.actions = actions
        singleton.interview.data = data
        singleton.interview.form = formBlueprint
        singleton.interview.preload = preload
        next()
      }).catch(err => {
        throw err
      })
    })
}
