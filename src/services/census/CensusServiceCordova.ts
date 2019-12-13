import DatabaseService from '../database/DatabaseService'
import CensusServiceAbstract from './CensusServiceAbstract'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import FormService from '../form/FormService'

export default class CensusServiceCordova extends CensusServiceAbstract {

  async getCensusForm (studyId: string, censusTypeId: string): Promise<Form> {
    const studyForm: StudyForm = await this.getCensusStudyForm(studyId, censusTypeId)
    return FormService.getForm(studyForm.formMasterId)
  }

  async hasCensusForm (studyId: string, censusTypeId: string): Promise<boolean> {
    const studyForm: StudyForm = await this.getCensusStudyForm(studyId, censusTypeId)
    return (studyForm instanceof StudyForm)
  }

  async getCensusStudyForm (studyId: string, censusTypeId: string): Promise<StudyForm> {
    const repo = await DatabaseService.getRepository(StudyForm)
    return repo.createQueryBuilder('sf')
      .where('sf.deletedAt is NULL')
      .andWhere('sf.studyId = :studyId', {studyId})
      .andWhere('sf.censusTypeId = :censusTypeId', {censusTypeId})
      .andWhere(sq =>
        'sf.formMasterId in ' + sq.subQuery()
          .select('id')
          .from(Form)
          .where('form.isPublished = 1')
          .andWhere('form.deletedAt is NULL')
          .getQuery()
      ).getOne()
  }

}
