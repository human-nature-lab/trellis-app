import { RedirectOption, Route, RouteConfig } from 'vue-router'
import InterviewService from '../../services/interview/InterviewService'
import { isUndefined } from '../../services/util'
import { GuardConfig } from '../GuardQueue'

let interview
export default {
  name: 'CompletedSurveyGuard',
  async condition (to: Route) {
    try {
      interview = null
      interview = await InterviewService.getInterview(to.params.interviewId)
      return interview && interview.survey && isUndefined(interview.survey.completedAt)
    } catch (err) {
      return true
    }
  },
  redirect (to: Route): RedirectOption {
    if (interview) {
      return { name: 'RespondentForms', params: { studyId: to.params.studyId, respondentId: interview.survey.respondentId }}
    }
  }
} as GuardConfig
