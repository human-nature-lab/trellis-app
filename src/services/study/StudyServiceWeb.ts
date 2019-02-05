import StudyServiceAbstract from './StudyServiceAbstract'
import Study from '../../entities/trellis/Study'
import http, {adminInst} from '../http/AxiosInstance'

export default class StudyServiceWeb extends StudyServiceAbstract {

  private allStudiesPromise!: Promise<Study[]>

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

  async getAllStudies (): Promise<Study[]> {
    if (this.allStudiesPromise) {
      return await this.allStudiesPromise
    }

    this.allStudiesPromise = adminInst.get('study').then(res => {
      this.allStudiesPromise = null
      return res.data.studies.map(s => new Study().fromSnakeJSON(s))
    })

    return await this.allStudiesPromise
  }
}
