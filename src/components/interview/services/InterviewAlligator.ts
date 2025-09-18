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
import QuestionDatumRecycler from './recyclers/QuestionDatumRecycler'
import Interview from '../../../entities/trellis/Interview'
import { JSF32bSource, Random } from '@/lib/random/random'

const MAX_RECURSION_DEPTH = 100

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

export function locationsAreEqual (a: InterviewLocation, b: InterviewLocation) {
  return a && b &&
    a.page === b.page &&
    a.section === b.section &&
    a.sectionFollowUpRepetition === b.sectionFollowUpRepetition &&
    a.sectionRepetition === b.sectionRepetition
}

export default class InterviewAlligator {
  public updatePagesCalled = 0
  public skipped: InterviewLocation[]
  private index = 0
  private pages: InterviewLocation[]
  private form: Form
  private data: DataStore
  private interview: Interview
  private sectionIndex: Map<string, Section> = new Map()
  private pageIndex: Map<string, QuestionGroup> = new Map()
  private sectionToNumIndex: Map<string, number> = new Map()
  private pageToNumIndex: Map<string, number> = new Map()
  private varNameToQuestionIndex: Map<string, Question> = new Map()
  private skipService = new SkipService()
  public hasDataChanges = true
  private skipCache = new Map()
  private lastPageHash = 0

  constructor (private manager: InterviewManager) {
    this.form = manager.blueprint
    this.data = manager.data
    this.interview = manager.interview
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
    const seed = this.interview.surveyId
    const rand = new Random(new JSF32bSource(seed))
    for (let s = 0; s < this.form.sections.length; s++) {
      const section = this.form.sections[s]
      this.sectionIndex.set(section.id, section)
      this.sectionToNumIndex.set(section.id, s)
      const pages = this.form.sections[s].questionGroups
      if (section.formSections[0].randomizePages) {
        rand.shuffle(pages)
        console.debug('randomizing pages', seed, pages.map(p => p.id))
        // this.form.sections[s].questionGroups = pages
      }
      for (let p = 0; p < pages.length; p++) {
        const page = pages[p]
        this.skipService.register(page.skips)
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
      sectionFollowUpRepetition,
    } as InterviewLocation
    if (this.shouldSkipPage(loc)) {
      // console.log('skipping', JSON.stringify(loc), JSON.stringify(this.data.conditionTags), Array.from(this.getConditionTagSet(loc.sectionRepetition, loc.sectionFollowUpDatumId)))
      // this.skipped.push(loc)
    } else {
      this.pages.push(loc)
    }
  }

  // Here we are using a simple algorithm with an avalanche effect to compute the "hash" number. Small changes yield
  // large differences and the "hash" for each interview state has a high probability of being unique
  private getCurrentHash (): number {
    let val = 16807 % 2147483647
    function hashVal (add: number) {
      val = (val + add) * 16807 % 2147483647
    }
    for (const page of this.pages) {
      hashVal(page.page + 1)
      hashVal(page.section + 1)
      hashVal(page.sectionRepetition + 1)
      hashVal(page.sectionFollowUpRepetition + 1)
    }
    return val
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
      return loc.sectionFollowUpRepetition
        ? isSame && loc.sectionFollowUpDatumId === l.sectionFollowUpDatumId
        : isSame && loc.sectionFollowUpRepetition === l.sectionFollowUpRepetition
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
    const qd = questionData.find((qd: QuestionDatum) => {
      return qd.questionId === followUpQuestionId
    })
    if (!qd) {
      throw new Error(`No question datum exists for question with id of ${followUpQuestionId} yet`)
    }
    return qd.data
  }

  private updatePages (depth = 0) {
    this.skipCache.clear()
    this.updatePagesCalled++
    const initLocation: InterviewLocation = this.loc
      ? JSON.parse(JSON.stringify(this.loc))
      : {
          page: 0,
          section: 0,
          sectionRepetition: 0,
          sectionFollowUpRepetition: 0,
        }
    let actuallyUpdated = 0
    this.pages.splice(this.index)
    for (let s = initLocation.section; s < this.form.sections.length; s++) {
      const section = this.form.sections[s]
      const isInitialSection = initLocation.section === s
      // TODO: Check if the section is repeated
      if (section.followUpQuestionId) {
        const sortMethod: SortMethod = section.formSections[0].randomizeFollowUp ? SortMethod.RANDOM : SortMethod.NATURAL
        let data: Datum[] = this.getFollowUpQuestionDatum(section.followUpQuestionId)
        const initFollowUpRepetition = isInitialSection ? initLocation.sectionFollowUpRepetition : 0
        data = data.slice() // Make new array that we can sort
        // TODO: Sort based on sort method
        data.sort(function (a, b) {
          return sortMethod === SortMethod.NATURAL ? a.sortOrder - b.sortOrder : a.randomSortOrder - b.randomSortOrder
        })
        for (let d = initFollowUpRepetition; d < data.length; d++) {
          const datum = data[d]
          const isSameRepetitionAsInitial = isInitialSection && d === initLocation.sectionFollowUpRepetition
          const initPage = isSameRepetitionAsInitial ? initLocation.page : 0
          actuallyUpdated += this.addLocationPages(initPage, section, datum.id, d, 0)
        }
      } else {
        const initPage = isInitialSection ? initLocation.page : 0
        actuallyUpdated += this.addLocationPages(initPage, section, null, 0, 0)
      }
    }

    // Keep calling updatePages until it reaches a stable state
    if (depth > MAX_RECURSION_DEPTH) {
      throw new Error(`updatePages recursion limit reached. not able to stabilize within ${MAX_RECURSION_DEPTH} calls`)
    }
    const hash = this.getCurrentHash()
    if (hash !== this.lastPageHash) {
      this.lastPageHash = hash
      this.updatePages(depth + 1)
    }
    this.hasDataChanges = false
  }

  private addLocationPages (initPage: number, section: Section, sectionFollowUpDatumId?: string, sectionFollowUpRepetition?: number, sectionRepetition?: number) {
    let updated = 0
    for (let p = initPage; p < section.questionGroups.length; p++) {
      const page = section.questionGroups[p]
      this.addLocation(page.id, section.id, sectionFollowUpDatumId, sectionFollowUpRepetition, sectionRepetition)
      updated++
    }
    return updated
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
    return this.skipService.shouldSkip(page.skips, conditionTagNames, this.manager, loc, this.skipCache)
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

  public makePageQuestionDatum (section: number, page: number): void {
    const currentPage = this.form.sections[section].questionGroups[page]
    const location = this.loc
    for (const questionBlueprint of currentPage.questions) {
      const hasExistingDatum = this.data.locationHasQuestionDatum(
        questionBlueprint.id,
        location.sectionRepetition,
        location.sectionFollowUpDatumId)
      if (!hasExistingDatum) {
        this.makeQuestionDatum(questionBlueprint)
      }
    }
  }

  public makeQuestionDatum (question: Question): QuestionDatum {
    // PERF: This could be optimized by using 'get' instead of getNoKey
    const questionDatum = QuestionDatumRecycler.getNoKey(this.interview, this.loc, question)
    this.data.add(questionDatum)
    return questionDatum
  }

  public getActionQuestionDatum (action: Action): QuestionDatum|null {
    if (!action.questionId) throw new Error('invalid question')
    const questionData = this.data.getQuestionDataByQuestionId(action.questionId)
    for (const qDatum of questionData) {
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
              sectionFollowUpRepetition: loc.sectionFollowUpRepetition,
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
