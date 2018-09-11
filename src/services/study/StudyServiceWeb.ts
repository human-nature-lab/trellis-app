import StudyServiceAbstract from './StudyServiceAbstract'
import Study from '../../entities/trellis/Study'
import http from '../http/AxiosInstance'

class StudyServiceWeb extends StudyServiceAbstract {
  async getStudy (studyId: string): Promise<Study> {
    let res = await http().get(`study/${studyId}`)
    return new Study().fromSnakeJSON(res.data.study)
  }

  async getUserStudies (userId: string): Promise<Study[]> {
    // TODO: implement this correctly for web
    return this.getMyStudies()
  }

  async getMyStudies (): Promise<Study[]> {
    const res = await http().get(`me/studies`)
    return res.data.studies.map( s => new Study().fromSnakeJSON(s) )
  }
}

export default StudyServiceWeb
