import { RedirectOption, Route, RouteConfig } from 'vue-router'
import InterviewService from '../../services/interview/InterviewService'
import { isUndefined } from '../../services/util'
import { GuardConfig } from './GuardQueue'

export async function oldGuard (to, from, next) {
  try {
    console.log('interviewId', to.params.interviewId)
    const interview = await InterviewService.getInterview(to.params.interviewId)
    console.log('interview', interview)
    if (interview.survey.completedAt === null) {
      next()
    } else {
      // If the survey has been completed, redirect to the respondent forms page
      next({ name: 'RespondentForms', params: { studyId: to.params.studyId, respondentId: interview.survey.respondentId }, replace: true })
    }
  } catch (err) {
    next()
  }
}

let interview
export default {
  async condition (to: Route) {
    try {
      interview = null
      interview = await InterviewService.getInterview(to.params.interviewId)
      return interview && interview.survey && !isUndefined(interview.survey.completedAt)
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
