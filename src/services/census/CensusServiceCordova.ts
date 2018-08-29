import DatabaseService from '../database/DatabaseService'
import CensusServiceAbstract from './CensusServiceAbstract'
import StudyForm from '../../entities/trellis/StudyForm'

export default class CensusServiceCordova extends CensusServiceAbstract {

  async getCensusForm (studyId, censusTypeId) {
    const repository = await DatabaseService.getRepository(StudyForm)
    const studyForm = await repository.findOneOrFail({ deletedAt: null, studyId: studyId, censusTypeId: censusTypeId })
    return studyForm.form
  }

  async hasCensusForm (studyId, censusTypeId) {
    const repository = await DatabaseService.getRepository(StudyForm)
    const studyForm = await repository.findOne({ deletedAt: null, studyId: studyId, censusTypeId: censusTypeId })
    return (studyForm instanceof StudyForm)
  }

}
