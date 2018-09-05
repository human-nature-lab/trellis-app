import Interview from '../../entities/trellis/Interview'
import {now} from '../DateService'
import SingletonService from '../SingletonService'
import DatabaseService from '../database/DatabaseService'
import InterviewServiceInterface from './InterviewServiceInterface'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import UserService from '../user/UserService'

export default class InterviewServiceCordova implements InterviewServiceInterface {

  async getInterview (id: string) {
    const repo = await DatabaseService.getRepository(Interview)
    const interview = await repo.findOne({
      id,
      relations: ['survey', 'user']
    })
    return interview
  }

  async create (surveyId: string) {
    const repo = await DatabaseService.getRepository(Interview)
    const user = await UserService.getCurrentUser()
    let interview = new Interview()
    interview.startTime = now()
    interview.surveyId = surveyId
    interview.userId = user.id
    interview = await repo.save(interview)
    return await this.getInterview(interview.id)
  }

  async complete (id: string) {
    const repo = await DatabaseService.getRepository(Interview)
    let interview = await repo.createQueryBuilder()
      .update(Interview)
      .set({ endTime: now()})
      .where('id = :id', { id })
      .execute()
    return interview
  }

  async getActions (interviewId: string) {
    const repo = await DatabaseService.getRepository(Action)
    let actions = await repo.find({
      interviewId,
      deletedAt: null
    })
    return actions
  }

  async saveActions (interviewId: string, actions: Action[]) {
    const repo = await DatabaseService.getRepository(Action)
    let res = await repo.insert(actions)
    return res
  }

  async getData (interviewId: string) {
    const repo = await DatabaseService.getRepository(QuestionDatum)
    console.log('TODO: Fetch QuestionDatum and condition tags')
    return {
      data: [],
      conditionTags: {
        survey: [],
        respondent: [],
        section: []
      }
    }
  }

  async saveData (interviewId: string, diff: InterviewDeltaInterface) {

  }

  async getPreload (interviewId: string) {
    return null
  }
}
