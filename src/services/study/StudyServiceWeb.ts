import StudyServiceAbstract from './StudyServiceAbstract'
import Study from '../../entities/trellis/Study'
import http from '../http/AxiosInstance'

class StudyServiceWeb extends StudyServiceAbstract {
  getStudy (studyId: string): Promise<Study> {
    return http().get(`study/${studyId}`)
      .then(res => {
        if (res.status >= 200 && res.status < 400) {
          return new Study().fromJSON(res.data.study)
        } else {
          throw Error('Unable to retrieve study with id: ' + studyId)
        }
      })
  }

  getMyStudies (): Promise<Study[]> {
    return http().get(`me/studies`).then(res => {
      let studies: Study[] = []
      for (let i = 0; i < res.data.studies.length; i++) {
        studies.push(new Study().fromJSON(res.data.studies[i]))
      }
      return studies
    })
  }
}

export default new StudyServiceWeb()
