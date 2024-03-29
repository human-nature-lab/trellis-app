import Emitter from '../../../classes/Emitter'
import AssignConditionTag from '../../../entities/trellis/AssignConditionTag'
import Choice from '../../../entities/trellis/Choice'
import Datum from '../../../entities/trellis/Datum'
import Form from '../../../entities/trellis/Form'
import Interview from '../../../entities/trellis/Interview'
import Question from '../../../entities/trellis/Question'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Page from '../../../entities/trellis/QuestionGroup'
import Section from '../../../entities/trellis/Section'
import SaferEvalService from '../../../services/SaferEvalService'
import { ConditionTagScope } from '../../../services/interview/InterviewDataInterface'
import { defaultLoggingService as logger } from '../../../services/logging'
import QT from '../../../static/question.types'
import InterviewAlligator, { InterviewLocation } from '../services/InterviewAlligator'
import FormConditionTagRecycler from '../services/recyclers/FormConditionTagRecycler'
import QuestionDatumRecycler from '../services/recyclers/QuestionDatumRecycler'
import RespondentConditionTagRecycler from '../services/recyclers/RespondentConditionTagRecycler'
import SectionConditionTagRecycler from '../services/recyclers/SectionConditionTagRecycler'
import ActionStore from './ActionStore'
import { createConditionAssignmentAPI } from './ConditionAssignmentAPI'
import { ConditionAssignmentError } from './ConditionAssignmentError'
import ConditionTagStore from './ConditionTagStore'
import DataStore from './DataStore'
import RespondentFillStore from './RespondentFillStore'

export default class InterviewManagerBase extends Emitter {

  public navigator: InterviewAlligator
  protected shouldSaveData: boolean = false
  protected shouldSaveActions: boolean = false

  // Indexes and data stores
  protected respondentFills: RespondentFillStore = new RespondentFillStore()
  protected conditionAssigner = new SaferEvalService()
  protected varNameIndex: Map<string, string> = new Map()
  protected questionIdToSectionIndex: Map<string, Section> = new Map()
  protected questionIdToPageIndex: Map<string, Page> = new Map()
  protected choiceIndex: Map<string, Choice> = new Map()
  protected initialLocation!: InterviewLocation

  public questionIndex: Map<string, Question> = new Map()
  public questionIdToSectionNum: Map<string, number> = new Map()
  public questionIdToPageNum: Map<string, number> = new Map()

  public conditionAssignmentErrors: ConditionAssignmentError[] = []
  public data: DataStore
  public actions: ActionStore
  public blueprint: Form
  public interview: Interview

  /**
   * Load and sort the form structure
   * @param {Form} blueprint
   */
  protected loadBlueprintAndCreateIndexes (blueprint: Form): void {
    this.blueprint = blueprint.copy()
    ConditionTagStore.clear()
    this.varNameIndex.clear()
    this.questionIndex.clear()
    this.questionIdToPageIndex.clear()
    this.questionIdToSectionIndex.clear()
    // Sort all levels
    this.blueprint.sections.sort((sectionA, sectionB) => {
      return sectionA.formSections[0].sortOrder - sectionB.formSections[0].sortOrder
    })

    for (let s = 0; s < this.blueprint.sections.length; s++) {
      let section = this.blueprint.sections[s]
      section.isRepeatable = section.formSections[0].isRepeatable
      section.maxRepetitions = section.formSections[0].maxRepetitions
      section.followUpQuestionId = section.formSections[0].followUpQuestionId
      section.questionGroups.sort((pageA, pageB) => {
        return pageA.sectionQuestionGroup.questionGroupOrder - pageB.sectionQuestionGroup.questionGroupOrder
      })
      for (let p = 0; p < section.questionGroups.length; p++) {
        let page = section.questionGroups[p]
        page.skips.sort((skipA, skipB) => skipA.precedence - skipB.precedence)
        page.questions.sort((questionA, questionB) => {
          return questionA.sortOrder - questionB.sortOrder
        })
        for (let question of page.questions) {
          question.varName = question.varName.trim()
          if (this.varNameIndex.has(question.varName)) {
            throw new Error(`The var_name "${question.varName}" occurs more than once in this form. Make sure all variables are unique.`)
          }
          this.varNameIndex.set(question.varName, question.id)
          this.questionIndex.set(question.id, question)
          if (question.choices) {
            question.choices.sort((cA, cB) => {
              return cA.sortOrder - cB.sortOrder
            })
            for (let qc of question.choices) {
              this.choiceIndex.set(qc.choiceId, qc.choice)
            }
          }
          this.questionIdToPageNum.set(question.id, p)
          this.questionIdToSectionNum.set(question.id, s)
          this.questionIdToSectionIndex.set(question.id, section)
          this.questionIdToPageIndex.set(question.id, page)
        }
      }
    }
  }


  /**
   * Register all condition assignment functions which will be executed when the respondent navigates between pages
   */
  protected initializeConditionAssignment (): void {
    this.conditionAssigner.clear()
    this.blueprint.sections.forEach((section, sectionIndex) => {
      section.pages.forEach((page, pageIndex) => {
        page.questions.forEach(question => {
          question.assignConditionTags.forEach(act => {
            ConditionTagStore.add(act.conditionTag)
            try {
              this.conditionAssigner.register(act.id, act.logic)
            } catch (err) {
              console.error('Condition assignment error')
              console.error(err)
              this.conditionAssignmentErrors.push({
                page: pageIndex,
                section: sectionIndex,
                sectionRepetition: 0,
                sectionFollowUpRepetition: 0,
                error: {
                  component: 'InterviewManagerBase.ts',
                  stack: err.stack.toString(),
                  message: err.message,
                  name: err.name
                },
                logic: act.logic
              })
            }
          })
        })
      })
    })
  }

  /**
   * Turn data persistence on or off
   * @param val
   */
  public setSaveData (val: boolean) {
    this.shouldSaveData = val
  }

  /**
   * Turn actions persistence on or off
   * @param val
   */
  public setSaveActions (val: boolean) {
    this.shouldSaveActions = val
  }

  /**
   * Set the initial location of the interview
   * @param location
   */
  setInitialLocation (location: object) {
    const loc = {
      page: 0,
      section: 0,
      sectionRepetition: 0,
      sectionFollowUpRepetition: 0,
      sectionFollowUpDatumId: null
    }
    if (location) {
      for (let key of Object.keys(loc)) {
        if (location[key] != null) {
          loc[key] = location[key]
        }
      }
    }
    this.initialLocation = loc
  }

  /**
   * Get the question blueprint for specific questionId
   * @param {string} questionId
   * @returns {Question}
   */
  protected findQuestionBlueprint (questionId: string): Question {
    return this.questionIndex.get(questionId)
  }

  /**
   * Make a single questionDatum from the provided questionBlueprint
   * @param {Question} question
   * @returns {QuestionDatum}
   */
  protected makeQuestionDatum (question: Question): QuestionDatum {
    let questionDatum = QuestionDatumRecycler.getNoKey(this, question) // OPTIMIZATION: This could be optimized by using 'get' instead of getNoKey
    this.data.add(questionDatum)
    return questionDatum
  }

  /**
   * Get a single section
   * @param {number} section
   * @returns {Section}
   */
  protected getSection (section: number): Section {
    return this.blueprint.sections[section]
  }

  /**
   * Get a single page
   * @param {number} section
   * @param {number} page
   * @returns {any}
   */
  protected getPage (section: number, page: number) {
    return this.getSection(section).pages[page]
  }

  /**
   * Make all non-existent question datum for the current page
   */
  protected makePageQuestionDatum (section: number, page: number): void {
    let currentPage = this.getPage(section, page)
    const location = this.navigator.loc
    for (let questionBlueprint of currentPage.questions) {
      if (!this.data.locationHasQuestionDatum(questionBlueprint.id, location.sectionRepetition, location.sectionFollowUpDatumId)) {
        this.makeQuestionDatum(questionBlueprint)
      }
    }
  }

  /**
   * Assign the specified condition tag
   * @param {AssignConditionTag} act
   */
  protected assignConditionTag (act: AssignConditionTag): void {
    // TODO: We could check for existing condition tags before creating it again, but this will
    // be taken care of by the resetting of the form and replaying existing conditions for pages
    // that are being modified as opposed to being created for the first time
    switch (act.scope) {
      case 'section':
        this.data.addTag(ConditionTagScope.SECTION, SectionConditionTagRecycler.getNoKey(this, act), act.conditionTag)
        break
      case 'form':
        this.data.addTag(ConditionTagScope.SURVEY, FormConditionTagRecycler.getNoKey(this, act), act.conditionTag)
        break
      case 'respondent':
      default:
        this.data.addTag(ConditionTagScope.RESPONDENT, RespondentConditionTagRecycler.getNoKey(this.interview, act), act.conditionTag)
    }
  }

  questionsWithData () {
    const questionDefinitions: Question[] = this.navigator.currentQuestions()
    const location: InterviewLocation = this.navigator.loc
    let questionData: QuestionDatum[] = this.data.getQuestionDataByIds(questionDefinitions.map(q => q.id), location.sectionRepetition, location.sectionFollowUpDatumId)
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = question.copy() // Dereference the question
      // question = JSON.parse(JSON.stringify(question)) // Dereference the question
      // TODO: this might need to take into account section repetition and follow ups as well
      question.datum = questionData.find(q => q.questionId === question.id)
      // question.datum = question.datum.copy()
      return question
    })
  }

  /**
   * Assign the current condition tags
   */
  protected _evaluateConditionAssignment (): void {
    // TODO: This should probably be every question in the survey so far
    const questionsWithData: Question[] = this.questionsWithData()
    let vars = questionsWithData.reduce((vars, question) => {
      if (!question.datum || !question.datum.data) {
        throw new Error('question datum and data should already exist!')
      }
      switch (question.questionTypeId) {
        case QT.multiple_select:
          vars[question.varName] = question.datum.data.map(d => this.choiceIndex.get(d.choiceId).val)
          break
        case QT.relationship:
        case QT.geo:
        case QT.image:
        case QT.respondent_geo:
          vars[question.varName] = question.datum.data.map(d => d.val)
          break
        case QT.intro:
          vars[question.varName] = true
          break
        case QT.multiple_choice:
          vars[question.varName] = !!question.datum.data.length && !!question.datum.data[0].choiceId ?
            this.choiceIndex.get(question.datum.data[0].choiceId).val : undefined
          break
        default:
          vars[question.varName] = question.datum.data.length ? question.datum.data[0].val : undefined
      }
      return vars
    }, {})

    const api = createConditionAssignmentAPI(this.data, this.navigator)

    for (let question of questionsWithData) {
      for (let act of question.assignConditionTags) {
        try {
          if (this.conditionAssigner.run(act.id, vars, api)) {
            this.assignConditionTag(act)
          }
        } catch (err) {
          // err.component = 'InterviewManagerBase.ts'
          logger.log(err)
          this.conditionAssignmentErrors.push({
            page: this.navigator.loc.page,
            section: this.navigator.loc.section,
            sectionRepetition: this.navigator.loc.sectionRepetition,
            sectionFollowUpRepetition: this.navigator.loc.sectionFollowUpRepetition,
            logic: act.logic,
            error: {
              component: 'InterviewManagerBase.ts',
              stack: err.stack.toString(),
              message: err.message,
              name: err.name
            }
          })
        }
      }
    }
  }


  /**
   * Get all currently assigned condition tags
   * @param {number} sectionRepetition
   * @param {string} sectionFollowUpDatumId
   * @returns {string[]}
   */
  getConditionTags (sectionRepetition: number, sectionFollowUpDatumId: string): string[] {
    return this.data.getLocationConditionTagNames(sectionRepetition, sectionFollowUpDatumId)
  }

  getConditionTagSet (sectionRepetition: number, sectionFollowUpDatumId: string): Set<string> {
    return new Set(this.getConditionTags(sectionRepetition, sectionFollowUpDatumId))
  }

  getAllConditionTags () {
    return this.data.getAllConditionTagNames()
  }

  get hasDuplicateTags (): boolean {
    const conditionTags = this.getAllConditionTags()
    const conditionTagSet = new Set(conditionTags)
    return conditionTags.length !== conditionTagSet.size
  }

  getSortedQuestionDatumData (questionDatumId: string, useRandom: boolean = false): Datum[] {
    let data = this.data.getQuestionDatumById(questionDatumId).data
    if (useRandom) {
      data.sort(function (a, b) {
        return a['randomVal'] - b['randomVal']
      })
    } else {
      data.sort(function (a, b) {
        return a.sortOrder - b.sortOrder
      })
    }
    return data
  }

  /**
   * Get an array of the questions for the current page. This function handles merging existing datum with
   * the question blueprint and dereferences everything
   * @param {number} section
   * @param {number} sectionRepetition
   * @param {string} sectionFollowUpDatumId
   * @param {number} page
   * @returns {Question[]}
   */
  public getPageQuestions (section: number, sectionRepetition: number, sectionFollowUpDatumId: string, page?: number): Question[] {
    const questionDefinitions = this.navigator.currentQuestions()
    let questionData = this.data.getQuestionDataByIds(questionDefinitions.map(q => q.id), sectionRepetition, sectionFollowUpDatumId)
    // Copy and assign existing datum to each question
    return questionDefinitions.map(question => {
      question = question.copy() // Dereference the question
      // question = JSON.parse(JSON.stringify(question)) // Dereference the question
      // TODO: this should take into account section repetition and follow ups as well
      question.datum = questionData.find(q => q.questionId === question.id)
      return question
    })
  }

  /**
   * Get the questionDatum corresponding with this follow up section
   * @param {string} sectionFollowUpQuestionId
   * @returns {QuestionDatum}
   */
  private getFollowUpQuestionDatum (sectionFollowUpQuestionId: string): QuestionDatum {
    let qDatum = this.data.getQuestionDataByQuestionId(sectionFollowUpQuestionId)
    if (qDatum && qDatum.length > 1) {
      throw Error('We need to handle follow up questions. Too many question datum for this followUpQuestionId')
    }
    return qDatum ? qDatum[0] : null
  }

  /**
   * This method returns the follow up question_datum and data that are associated with the follow up question for that section
   * TODO: Right now this only gets the first question that matches the follow_up_question_id, but it should probably know
   * TODO: if a question is in a repeated section and get the correct question_datum(s) in that case
   * @param {String} sectionFollowUpQuestionId
   * @param {Number} currentRepetition - Will be used for handling follow up questions from repeated sections
   * @param {Number} currentFollowUpSection - Will be used for handling follow up questions from follow up sections
   * @returns {T | undefined}
   * @private
   */
  public getFollowUpQuestionDatumData (sectionFollowUpQuestionId: string, currentRepetition: number = 0, currentFollowUpSection: number = 0): Datum[] {
    let qDatum = this.getFollowUpQuestionDatum(sectionFollowUpQuestionId)
    // TODO: This should change if we're using randomization for follow up sections
    if (!qDatum || !qDatum.data) return []

    // Guard against repeated sections for now
    if (this.questionIdToSectionIndex.get(sectionFollowUpQuestionId).maxRepetitions || this.questionIdToSectionIndex.get(sectionFollowUpQuestionId).followUpQuestionId) {
      throw Error(`Can't handle follow up questions from repeated sections currently`)
    }
    qDatum.data.sort(function (a, b) {
      return a.sortOrder - b.sortOrder
    })
    return qDatum.data
  }

  protected get currentSection () {
    return this.navigator.currentSection()
  }
}
