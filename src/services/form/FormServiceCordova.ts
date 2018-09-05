import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from "../../entities/trellis/StudyForm";
import Form from "../../entities/trellis/Form";
import Question from "../../entities/trellis/Question";
import QuestionGroup from "../../entities/trellis/QuestionGroup";

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      studyId,
      deletedAt: null
    })
    return studyForms
  }

  async getForm (id: string, bareBones: boolean = false): Promise<Form> {
    console.log('getForm', id)
    const repo = await DatabaseService.getRepository(Form)
    let form
    if (bareBones) {
      // let sections = await repo.createQueryBuilder('section')
      //   .from(Section)
      //   .innerJoinAndSelect(qb => (
      //     qb
      //       .from(FormSection)
      //       .where('form_section.formId = :formId', {formId: id})
      //   ), 'form_sections').toSql()
      form = await repo.findOne({
        id,
        relations: ['sections']
      })
      const groups: QuestionGroup[] = []
      const promises: Promise<boolean>[] = []
      form.sections.forEach(section => {
        section.questionGroups.forEach(qg => {
          groups.push(qg)
          promises.push(new Promise(async (resolve) => {
            const r = await DatabaseService.getRepository(Question)
            qg.questions = await r.find({
              questionGroupId: qg.id,
              deletedAt: null
            })
            resolve(true)
          }))
        })
      })
      await Promise.all(promises)
      debugger
    } else {
      form = await repo.findOne({
        id,
        relations: ['sections']
      })
    }
    return form
  }

}
