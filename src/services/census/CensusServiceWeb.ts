import http from '../http/AxiosInstance'
import CensusServiceAbstract from "./CensusServiceAbstract";

export default class CensusServiceWeb extends CensusServiceAbstract {

  getCensusForm (studyId, censusTypeId) {
    return http().get(`study/${studyId}/form/census`, {
      params: {
        census_type: censusTypeId
      }
    }).then(res => res.data.form)
  }

  hasCensusForm (studyId, censusTypeId) {
    return this.getCensusForm(studyId, censusTypeId)
      .then(form => form ? true : false) // eslint-disable-line
  }

}
