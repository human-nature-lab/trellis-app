import InterviewService from '../../services/interview/InterviewService'

export default async function (to, from, next) {
  try {
    console.log('interviewId', to.params.interviewId)
    const interview = await InterviewService.getInterview(to.params.interviewId)
    console.log('interview', interview)
    if (interview.survey.completedAt === null) {
      next()
    } else {
      // If the survey has been completed, redirect to the respondent forms page
      next({ name: 'RespondentForms', params: { studyId: to.params.studyId, respondentId: interview.survey.respondentId } })
    }
  } catch (err) {
    next()
  }
}
