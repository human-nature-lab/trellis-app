import uuidv4 from 'uuid/v4'
import GeneratorService from '../../../../services/mock/GeneratorService'
const FORM_IDS = ['5612115f-9208-4696-9497-4398ae112f8b', '03551748-f180-44fa-9d58-c6b720c095e9', 'be587a4a-38c6-46cb-a787-1fcb4813b274', '5423bac0-b5b6-42d2-b06b-eca337683f2a']
let savedInterviewId
export default class InterviewServiceMock {
  static setInterviewId (interviewId) {
    savedInterviewId = interviewId
  }
  static getInterviewId () {
    return savedInterviewId
  }
  static getInterview (interviewId) {
    return GeneratorService.expandPromise({
      id: interviewId,
      survey_id: uuidv4,
      survey: {
        form_id: FORM_IDS[interviewId] || FORM_IDS[0], // An actual form for now
        respondent_id: uuidv4,
        study_id: uuidv4
      }
    })
  }
  static getActions () {
    return GeneratorService.expandPromise([])
  }
  static getData () {
    return GeneratorService.expandPromise([])
  }
}
