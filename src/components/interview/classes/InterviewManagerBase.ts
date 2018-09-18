import Emitter from "../../../classes/Emitter";
import Form from "../../../entities/trellis/Form";
import ConditionTagStore from "./ConditionTagStore";
import Page from "../../../entities/trellis/QuestionGroup";
import InterviewNavigator, {InterviewLocation} from "../services/InterviewNavigator";
import Section from "../../../entities/trellis/Section";
import RespondentFillStore from "./RespondentFillStore";
import Question from "../../../entities/trellis/Question";
import PersistSlave from '../../../classes/PersistSlave'
import ConditionAssignmentService from '../../../services/ConditionAssignmentService'
import QuestionDatum from "../../../entities/trellis/QuestionDatum";
import QuestionDatumRecycler from "../services/recyclers/QuestionDatumRecycler";
import DataStore from "./DataStore";
import ActionStore from "./ActionStore";
import AssignConditionTag from "../../../entities/trellis/AssignConditionTag";
import RespondentConditionTagRecycler from "../services/recyclers/RespondentConditionTagRecycler";
import FormConditionTagRecycler from "../services/recyclers/FormConditionTagRecycler";
import SectionConditionTagRecycler from "../services/recyclers/SectionConditionTagRecycler";
import Interview from "../../../entities/trellis/Interview";
import Datum from "../../../entities/trellis/Datum";

export default class InterviewManagerBase extends Emitter {

  protected navigator: InterviewNavigator
  protected _dataPersistSlave: PersistSlave
  protected _actionsPersistSlave: PersistSlave

  // Indexes and data stores
  protected respondentFills: RespondentFillStore = new RespondentFillStore()
  protected conditionAssigner: ConditionAssignmentService = new ConditionAssignmentService()
  protected varNameIndex: Map<string, string> = new Map()
  protected questionIndex: Map<string, Question> = new Map()
  protected questionIdToSectionIndex: Map<string, Section> = new Map()
  protected questionIdToPageIndex: Map<string, Page> = new Map()
  public questionIdToSectionNum: Map<string, number> = new Map()
  public questionIdToPageNum: Map<string, number> = new Map()

  protected data: DataStore
  protected actions: ActionStore

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
          this.varNameIndex.set(question.varName, question.id)
          this.questionIndex.set(question.id, question)
          if (question.choices) {
            question.choices.sort((cA, cB) => {
              return cA.sortOrder - cB.sortOrder
            })
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
    ConditionTagStore.clear()
    this.conditionAssigner.clear()
    this.blueprint.sections.forEach(section => {
      section.pages.forEach(page => {
        page.questions.forEach(question => {
          question.assignConditionTags.forEach(act => {
            ConditionTagStore.add(act.conditionTag)
            this.conditionAssigner.register(act.id, act.logic)
          })
        })
      })
    })
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
    for (let questionBlueprint of currentPage.questions) {
      if (!this.data.locationHasQuestionDatum(questionBlueprint.id, this.location.sectionRepetition, this.location.sectionFollowUpDatumId)) {
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
        this.data.addTag('section', SectionConditionTagRecycler.getNoKey(this, act))
        break
      case 'form':
        this.data.addTag('survey', FormConditionTagRecycler.getNoKey(this, act))
        break
      case 'respondent':
      default:
        this.data.addTag('respondent', RespondentConditionTagRecycler.getNoKey(this.interview, act))
    }
  }

  /**
   * Assign the current condition tags
   */
  _evaluateConditionAssignment (): void {
    // TODO: This should probably be every question in the survey so far
    let questionsWithData = this.getPageQuestions(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId, this.location.page)
    let vars = questionsWithData.reduce((vars, question) => {
      if (!question.datum || !question.datum.data) {
        throw Error('question datum and data should already exist!')
      }
      switch (question.questionType.name) {
        case 'multiple_select':
        case 'relationship':
        case 'geo':
        case 'photo':
          vars[question.varName] = question.datum.data.map(datum => datum.val)
          break
        default:
          vars[question.varName] = question.datum.data.length ? question.datum.data[0].val : undefined
      }
      return vars
    }, {})
    // console.log('condition assignment vars', vars)
    for (let question of questionsWithData) {
      for (let act of question.assignConditionTags) {
        try {
          if (this.conditionAssigner.run(act.id, vars)) {
            // console.log('assigning', act)
            this.assignConditionTag(act)
          }
        } catch (err) {
          console.error('Unable to assign condition tag correctly')
          throw err
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

  getConditionTagSet (sectionReptition: number, sectionFollowUpDatumId: string): Set<string> {
    return new Set(this.getConditionTags(sectionReptition, sectionFollowUpDatumId))
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
    page = page != null ? page : this.location.page
    let questionDefinitions: Question[] = this.getPage(section, page).questions
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

  public get location () {
    return this.navigator.location
  }

  protected get currentPage () {
    const l = this.location
    return this.getPage(l.section, l.page)
  }

  protected get currentSection () {
    return this.getSection(this.location.section)
  }
}
