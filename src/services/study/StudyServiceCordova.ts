import StudyServiceAbstract from './StudyServiceAbstract'
import DatabaseService from '../database/DatabaseService'
import Study from '../../entities/trellis/Study'

export default class StudyServiceCordova extends StudyServiceAbstract {
  async getStudy (studyId: string): Promise<Study> {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Study)
    return repository.findOne({ id: studyId, deletedAt: null })
  }

  async getMyStudies (): Promise<Study[]> {
    // TODO: get logged in user and restrict returned studies based on user
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Study)
    return repository.find({ deletedAt: null })
  }
}
