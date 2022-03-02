import InterviewManager from '../classes/InterviewManager'
import Form from '../../../entities/trellis/Form'
import Section from '../../../entities/trellis/Section'
import QuestionGroup from '../../../entities/trellis/QuestionGroup'
import DataStore from '../classes/DataStore'
import Datum from '../../../entities/trellis/Datum'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import Question from '../../../entities/trellis/Question'
import SkipService from '../../../services/SkipService'
import Action from '../../../entities/trellis/Action'
import { locToNumber } from './LocationHelpers'

export interface InterviewLocation {
  section: number
  sectionRepetition: number
  page: number
  sectionId?: string
  pageId?: string
  sectionFollowUpRepetition: number
  sectionFollowUpDatumId?: string
}

export interface InterviewQuestionLocation extends InterviewLocation {
  questionId: string
  questionTypeId: string
}

enum SortMethod {
  NATURAL,
  RANDOM
}

export default class InterviewAlligator {
  private index = 0
  private pages: InterviewLocation[]
  public skipped: InterviewLocation[]
  private form: Form
  private data: DataStore
  private sectionIndex: Map<string, Section> = new Map()
  private pageIndex: Map<string, QuestionGroup> = new Map()
  private sectionToNumIndex: Map<string, number> = new Map()
  private pageToNumIndex: Map<string, number> = new Map()
  private varNameToQuestionIndex: Map<string, Question> = new Map()

  private hasDataChanges: boolean = true

  public updatePagesCalled: number = 0

  constructor (private manager: InterviewManager) {
    this.form = manager.blueprint
    this.data = manager.data
    this.pages = []
    this.skipped = []
    this.createIndexes()
  }

  public initialize () {
    this.data.on('change', this.indicateThatDataHasChanged, this)
    this.updatePages()
    this.goToFirstValidLocation()
  }

  public destroy () {
    this.data.off('change', this.indicateThatDataHasChanged)
  }

  private indicateThatDataHasChanged () {
    this.hasDataChanges = true
  }

  private updateIfNecessary () {
    if (this.hasDataChanges) {
      this.updatePages()
    } else {
      // console.log('no data updates found')
    }
  }

  private createIndexes (): void {
    for (let s = 0; s < this.form.sections.length; s++) {
      const section = this.form.sections[s]
      this.sectionIndex.set(section.id, section)
      this.sectionToNumIndex.set(section.id, s)
      for (let p = 0; p < section.questionGroups.length; p++) {
        const page = section.questionGroups[p]
        this.pageIndex.set(page.id, page)
        this.pageToNumIndex.set(page.id, p)
        for (const question of page.questions) {
          this.varNameToQuestionIndex.set(question.varName, question)
        }
      }
    }
  }

  private addLocation (pageId: string, sectionId: string, followUpDatumId?: string, sectionFollowUpRepetition?: number, sectionRepetition?: number): void {
    const loc = {
      pageId,
      page: this.pageToNumIndex.get(pageId),
      sectionId,
      section: this.sectionToNumIndex.get(sectionId),
      sectionRepetition,
      sectionFollowUpDatumId: followUpDatumId,
      sectionFollowUpRepetition
    } as InterviewLocation
    if (this.shouldSkipPage(loc)) {
      // console.log('skipping', JSON.stringify(loc), JSON.stringify(this.data.conditionTags), Array.from(this.getConditionTagSet(loc.sectionRepetition, loc.sectionFollowUpDatumId)))
      // this.skipped.push(loc)
    } else {
      this.pages.push(loc)
    }
  }

  /**
   * Test if a location is a valid one for this interview in its current state
   * @param {InterviewLocation} loc
   * @returns {boolean}
   */
  public isValidLocation (loc: InterviewLocation): boolean {
    this.updateIfNecessary()
    return this.pages.findIndex(l => {
      const isSame = l.page === loc.page &&
        l.section === loc.section &&
        l.sectionRepetition === loc.sectionRepetition
      return loc.sectionFollowUpRepetition ?
        isSame && loc.sectionFollowUpDatumId === l.sectionFollowUpDatumId :
        isSame && loc.sectionFollowUpRepetition === l.sectionFollowUpRepetition
    }) > -1
  }

  /**
   * Returns an array of all data (datum) present on the folloow up question
   * @param {string} followUpQuestionId
   * @returns {Datum[]}
   */
  private getFollowUpQuestionDatum (followUpQuestionId: string): Datum[] {
    const questionData: QuestionDatum[] = this.data.getQuestionDataByQuestionId(followUpQuestionId)
    if (!questionData) {
      return []
    }
    // TODO: This assumes that the follow up question is not inside another follow up section
    let qd = questionData.find((qd: QuestionDatum) => {
      return qd.questionId === followUpQuestionId
    })
    if (!qd) {
      throw new Error(`No question datum exists for question with id of ${followUpQuestionId} yet`)
    }
    return qd.data
  }

  private updatePages () {
    this.updatePagesCalled++
    const initLocation: InterviewLocation = this.loc ? JSON.parse(JSON.stringify(this.loc)) : {
      page: 0,
      section: 0,
      sectionRepetition: 0,
      sectionFollowUpRepetition: 0
    }
    let actuallyUpdated = 0
    const prevPages = this.pages.length
    const expectedUpdate = this.pages.length - this.index
    this.pages.splice(this.index)
    for (let s = initLocation.section; s < this.form.sections.length; s++) {
      const section = this.form.sections[s]
      const isInitialSection = initLocation.section === s
      // TODO: Check if the section is repeated
      if (section.followUpQuestionId) {
        const sortMethod: SortMethod = section.formSections[0].randomizeFollowUp ? SortMethod.RANDOM : SortMethod.NATURAL
        let data: Datum[] = this.getFollowUpQuestionDatum(section.followUpQuestionId)
        // console.log('follow up data', data.length)
        // if (!data.length) {
        //   // Marking skipped repeated section
        //   for (let page of section.questionGroups) {
        //     this.skipped.push({
        //       pageId: page.id,
        //       page: this.pageToNumIndex.get(page.id),
        //       sectionId: section.id,
        //       section: this.sectionToNumIndex.get(section.id),
        //       sectionRepetition: 0,
        //       sectionFollowUpDatumId: null,
        //       sectionFollowUpRepetition: 0
        //     } as InterviewLocation)
        //   }
        // }
        const initFollowUpRepetition = isInitialSection ? initLocation.sectionFollowUpRepetition : 0
        data = data.slice() // Make new array that we can sort
        // TODO: Sort based on sort method
        data.sort(function (a, b) {
          return sortMethod === SortMethod.NATURAL ? a.sortOrder - b.sortOrder : a.randomSortOrder - b.randomSortOrder
        })
        for (let d = initFollowUpRepetition; d < data.length; d++) {
          const datum = data[d]
          const isSameRepetitionAsInitial = isInitialSection && d === initLocation.sectionFollowUpRepetition
          const initPage =  isSameRepetitionAsInitial ? initLocation.page : 0
          for (let p = initPage; p < section.questionGroups.length; p++) {
            const page = section.questionGroups[p]
            this.addLocation(page.id, section.id, datum.id, d, 0)
            actuallyUpdated++
          }
        }
      } else {
        const initPage = isInitialSection ? initLocation.page : 0
        for (let p = initPage; p < section.questionGroups.length; p++) {
          const page = section.questionGroups[p]
          this.addLocation(page.id, section.id, null, 0, 0)
          actuallyUpdated++
        }
      }
    }
    // console.log(`updated ${actuallyUpdated} pages. expected to update ~${expectedUpdate} / ${prevPages}`)
    this.hasDataChanges = false
  }

  private goToFirstValidLocation () {
    while (this.index < this.pages.length && this.shouldSkipPage(this.loc)) {
      this.next()
    }
  }

  getConditionTagSet (sectionRepetition: number, sectionFollowUpDatumId?: string): Set<string> {
    return new Set(this.data.getLocationConditionTagNames(sectionRepetition, sectionFollowUpDatumId))
  }

  private shouldSkipPage (loc: InterviewLocation): boolean {
    const conditionTagNames = this.getConditionTagSet(loc.sectionRepetition, loc.sectionFollowUpDatumId)
    const page = this.pageIndex.get(loc.pageId)
    return SkipService.shouldSkip(page.skips, conditionTagNames)
  }

  public seekTo (loc: InterviewLocation): boolean {
    this.updateIfNecessary()
    for (let i = 0; i < this.pages.length; i++) {
      if (this.locationsAreNumericallyTheSame(loc, this.pages[i])) {
        this.index = i
        return true
      }
    }
    return false
  }

  public locationsAreNumericallyTheSame (locA: InterviewLocation, locB: InterviewLocation): boolean {
    return locA.section === locB.section &&
      locA.page === locB.page &&
      locA.sectionRepetition === locB.sectionRepetition &&
      locA.sectionFollowUpRepetition === locB.sectionFollowUpRepetition
  }

  public locationIsAheadOfCurrent (location: InterviewLocation): boolean {
    return locToNumber(location) > locToNumber(this.loc)
  }

  public getActionQuestionDatum (action: Action): QuestionDatum|null {
    if (!action.questionId) throw new Error('invalid question')
    const questionData = this.data.getQuestionDataByQuestionId(action.questionId)
    for (let qDatum of questionData) {
      if (qDatum.followUpDatumId) {
        // TODO: Lookup questionDatum by datum eventOrder
        const datum = this.data.getDatumById(qDatum.followUpDatumId)
        if (datum.actionId === action.followUpActionId) {
          return qDatum
        }
      } else if (questionData.length === 1) {
        return qDatum
      }
    }
    throw new Error(`Unable to find matching question datum for action ${action}`)
  }

  public zero (): void {
    this.index = 0
    // this.indicateThatDataHasChanged()
  }

  public getQuestionByVarName (varName: string): Question {
    return this.varNameToQuestionIndex.get(varName)
  }

  public getLocByVarName (varName: string, sectionRepetition: number, sectionFollowUpRepetition: number): InterviewQuestionLocation | null {
    for (const loc of this.pages) {
      const questionGroup: QuestionGroup = this.pageIndex.get(loc.pageId)
      if (loc.sectionRepetition === sectionRepetition && loc.sectionFollowUpRepetition === sectionFollowUpRepetition) {
        for (const question of questionGroup.questions) {
          if (question.varName === varName) {
            return {
              page: loc.page,
              section: loc.section,
              questionId: question.id,
              questionTypeId: question.questionTypeId,
              sectionRepetition: loc.sectionRepetition,
              sectionFollowUpDatumId: loc.sectionFollowUpDatumId,
              sectionFollowUpRepetition: loc.sectionFollowUpRepetition
            }
          }
        }
      }
    }
    return null
  }

  public get loc (): InterviewLocation {
    return this.pages[this.index]
  }

  public get nextLoc (): InterviewLocation {
    this.updateIfNecessary()
    return this.index < this.pages.length - 1 ? this.pages[this.index + 1] : undefined
  }

  public get isAtEnd (): boolean {
    this.updateIfNecessary()
    return this.index >= (this.pages.length - 1)
  }

  public get isAtStart (): boolean {
    return this.index === 0
  }

  public next (): void {
    this.updateIfNecessary()
    this.index++
  }

  public previous (): void {
    this.index--
    // this.updatePages()
  }

  public currentSection (): Section {
    return this.sectionIndex.get(this.loc.sectionId)
  }

  public currentPage (): QuestionGroup {
    return this.pageIndex.get(this.loc.pageId)
  }

  public currentPageId (): string {
    return this.currentPage().id
  }

  public currentQuestions (): Question[] {
    return this.currentPage().questions
  }
}
