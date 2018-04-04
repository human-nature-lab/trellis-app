import uuidv4 from 'uuid/v4'
import GeneratorService from '../../../../services/mock/GeneratorService'
export default class InterviewServiceMock {
  static getInterview (interviewId) {
    return GeneratorService.expandPromise({
      id: interviewId,
      survey_id: uuidv4,
      survey: {
        form_id: 'be587a4a-38c6-46cb-a787-1fcb4813b274', // An actual form for now
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
