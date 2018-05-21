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
          throw new Error('Could not contact interview actions service', err)
        }),
        InterviewService.getData(to.params.interviewId).catch(err => {
          throw new Error('Could not contac interview data service', err)
        }),
        FormService.getForm(interview.survey.form_id),
        InterviewService.getPreload(to.params.interviewId).catch(err => {
          console.error('preload data was not loaded', err)
          return []
        })
      ]).then(results => {
        let [actions, data, formBlueprint, preload] = results
        for (let d of data) {
          for (let datum of d.data) {
            for (let key in datum) {
              if (datum[key] === null || datum[key] === undefined) {
                delete datum[key]
              }
            }
          }
        }
        singleton.interview.interview = interview
        singleton.interview.actions = [] || actions
        singleton.interview.data = [] || data
        singleton.interview.form = formBlueprint
        singleton.interview.preload = preload
        next()
      }).catch(err => {
        throw err
      })
    })
}
