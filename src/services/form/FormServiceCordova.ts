import FormServiceInterface from './FormServiceInterface'
import DatabaseService from '../database/DatabaseService'
import StudyForm from '../../entities/trellis/StudyForm'
import Form from '../../entities/trellis/Form'
import Question from '../../entities/trellis/Question'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import {In, IsNull} from 'typeorm'
import {removeSoftDeleted} from "../database/SoftDeleteHelper";
import {isEqual} from 'lodash'
import Section from '../../entities/trellis/Section'
import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'

export default class FormServiceCordova implements FormServiceInterface {

  async getStudyForms (studyId: string): Promise<StudyForm[]> {
    const repo = await DatabaseService.getRepository(StudyForm)
    let studyForms = await repo.find({
      where: {
        studyId: studyId,
        censusTypeId: IsNull(),
        deletedAt: IsNull()
      }
    })
    return studyForms.filter(s => (s.form.isPublished && s.form.deletedAt === null))
  }

  async getForm (id: string, bareBones: boolean = false): Promise<Form> {
    console.log('getForm', id)
    const connection = await DatabaseService.getDatabase()
    const formRepository = await connection.getRepository(Form)

    const form = await formRepository.findOne({
      where: {
        id: id
      },
      relations: ['sections']
    })

    const questionGroupMap = {}
    const questionGroupIds = []
    form.sections.forEach((section) => {
      section.questionGroups.forEach((questionGroup) => {
        questionGroup.questions = []
        questionGroupMap[questionGroup.id] = questionGroup
        questionGroupIds.push(questionGroup.id)
      })
    })

    const questionRepository = await connection.getRepository(Question)
    const questions = await questionRepository.find({
      where: {
        questionGroupId: In(questionGroupIds),
        deletedAt: IsNull()
      }
    })

    questions.forEach((question) => {
      const questionGroup = questionGroupMap[question.questionGroupId]
      questionGroup.questions.push(question)
    })

    /*
    const sectionMap = {}
    const sectionIds = form.sections.map((section) => {
      sectionMap[section.id] = section
      return section.id
    })
    */

    /*
    let sectionIds = await connection.createQueryRunner().query(`select section_id from form_section where form_id = "${id}" and deleted_at is null`)
    console.log('sectionIds', sectionIds)
    sectionIds = sectionIds.map((sid) => {
      return sid.section_id
    })

    const sectionRepository = await connection.getRepository(Section)
    const sections = await sectionRepository.find({
      where: {
        id: In(sectionIds),
        deletedAt: IsNull()
      }
    })
    */

    /*
    const connection = await DatabaseService.getDatabase()
    const sectionQueryBuilder = await connection.getRepository(Section).createQueryBuilder("section")
    const sectionQuestionGroupQueryBuilder = await connection.getRepository(SectionQuestionGroup).createQueryBuilder("section_question_group")
    const questionGroupQueryBuilder = await connection.getRepository(QuestionGroup).createQueryBuilder("question_group")
    const questionQueryBuilder = await connection.getRepository(Question).createQueryBuilder("question")

    const sections = await sectionQueryBuilder
      .where('section.deleted_at is null')
      .andWhere(`section.id in (
                   select form_section.section_id from form_section where
                   form_section.form_id = :formId and
                   form_section.deleted_at is null)`, { formId: id })
      .leftJoinAndSelect('section.formSections', 'form_section')
      .leftJoinAndSelect('section.nameTranslation', 'translation')
      .getMany()

    // console.log('sections', sections)

    const sectionMap = {}
    const sectionIds = sections.map((section) => {
      sectionMap[section.id] = section
      return section.id
    })

    // console.log('sectionIds', sectionIds)

    const sectionQuestionGroups = await sectionQuestionGroupQueryBuilder
      .where('section_question_group.deleted_at is null')
      .andWhere('section_question_group.section_id in (:...sectionIds)', {sectionIds: sectionIds})
      .getMany()

    // console.log('sectionQuestionGroups', sectionQuestionGroups)

    const sectionQuestionGroupMap = {}
    const questionGroupIds = sectionQuestionGroups.map((sqg) => {
      sectionQuestionGroupMap[sqg.questionGroupId] = sqg
      return sqg.questionGroupId
    })

    const questionGroups = await questionGroupQueryBuilder
      .where('question_group.deleted_at is null')
      .andWhere(`question_group.id in (:...questionGroupIds)`, { questionGroupIds: questionGroupIds })
      .leftJoinAndSelect('question_group.skips', 'skip', 'skip.deleted_at is null')
      .leftJoinAndSelect('skip.conditionTags', 'condition_tag', 'condition_tag.deleted_at is null')
      .getMany()

    // console.log('questionGroups', questionGroups)

    const questionGroupMap = {}
    questionGroups.forEach((questionGroup) => {
      questionGroupMap[questionGroup.id] = questionGroup
    })

    const questions = await questionQueryBuilder
      .where('question.deleted_at is null')
      .andWhere(`question.question_group_id in (:...questionGroupIds)`, { questionGroupIds: questionGroupIds })
      .leftJoinAndSelect('question.questionType', 'question_type')
      .leftJoinAndSelect('question.questionParameters', 'question_parameter', 'question_parameter.deleted_at is null')
      .leftJoinAndSelect('question_parameter.parameter', 'parameter')
      .leftJoinAndSelect('question.assignConditionTags', 'assign_condition_tag', 'assign_condition_tag.deleted_at is null')
      .leftJoinAndSelect('assign_condition_tag.conditionTag', 'condition_tag', 'assign_condition_tag.deleted_at is null')
      .leftJoinAndSelect('question.questionTranslation', 'question_translation', 'question_translation_id', 'translation')
      .leftJoinAndSelect('question.choices', 'question_choice', 'question_choice.deleted_at is null')
      .leftJoinAndSelect('question_choice.choice', 'choice', 'choice.deleted_at is null')
      .leftJoinAndSelect('choice.choiceTranslation', 'choice_translation', 'choice_translation_id', 'translation')
      .getMany()

    // console.log('questions', questions)

    for (let i = 0; i < questions.length; i++) {
      let question = questions[i]
      let questionGroup = questionGroupMap[question.questionGroupId]
      if (questionGroup.questions === undefined) {
        questionGroup.questions = []
      }
      questionGroup.questions.push(question)
    }

    for (let i = 0; i < questionGroups.length; i++) {
      let questionGroup = questionGroups[i]
      // console.log('questionGroup', questionGroup)
      let sectionQuestionGroup = sectionQuestionGroupMap[questionGroup.id]
      // console.log('sectionQuestionGroup', sectionQuestionGroup)
      questionGroup.sectionQuestionGroup = sectionQuestionGroup
      let section = sectionMap[sectionQuestionGroup.sectionId]
      // console.log('section', section)
      if (section.questionGroups === undefined) {
        section.questionGroups = []
      }
      section.questionGroups.push(questionGroup)
    }
    */

    // form.sections = sections

    /*
    const groups: QuestionGroup[] = []
    const promises: Promise<boolean>[] = []
    //TODO: make this faster
    form.sections.forEach(section => {
      section.questionGroups.forEach(qg => {
        groups.push(qg)
        promises.push(new Promise(async (resolve) => {
          const r = await DatabaseService.getRepository(Question)
          qg.questions = await r.find({
            where: {
              questionGroupId: qg.id,
              deletedAt: IsNull()
            }
          })
          resolve(true)
        }))
      })
    })
    await Promise.all(promises)
    removeSoftDeleted(form)
    */

    console.log('finished form', form)

    return form
  }

}
