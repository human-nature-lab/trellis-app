import StudyServiceAbstract from './StudyServiceAbstract'
import Study from '../../entities/trellis/Study'
import http from '../http/AxiosInstance'

class StudyServiceWeb extends StudyServiceAbstract {
  getStudy (studyId: string): Promise<Study> {
    return http().get(`study/${studyId}`)
      .then(res => {
        if (res.status >= 200 && res.status < 400) {
          return new Study().fromSnakeJSON(res.data.study)
        } else {
          throw Error('Unable to retrieve study with id: ' + studyId)
        }
      })
  }

  getMyStudies (): Promise<Study[]> {
    return http().get(`me/studies`).then(res => {
      return res.data.studies.map(s => new Study().fromSnakeJSON(s))
    })
  }
}

export default new StudyServiceWeb()
