import InterviewManager from '../src/components/interview/classes/InterviewManager'
import { ActionPayload } from '../src/components/interview/services/actions/DatumOperations'
import Action from '../src/entities/trellis/Action'
import Form from '../src/entities/trellis/Form'
import moment from 'moment'
import Interview from '../src/entities/trellis/Interview'
import QuestionDatum from '../src/entities/trellis/QuestionDatum'
import RespondentConditionTag from '../src/entities/trellis/RespondentConditionTag'
import RespondentFill from '../src/entities/trellis/RespondentFill'
import { ConditionTagInterface } from '../src/services/interview/InterviewDataInterface'
import AT from '../src/static/action.types'
import { expect } from 'chai'

interface SimpleLocation {
  section?: number
  sectionRepetition?: number
  sectionFollowUpRepetition?: number
  sectionFollowUpDatumId?: string
  page: number
}

export class InterviewController {

  private n = 0
  public interview: Interview = new Interview()
  public manager: InterviewManager

  constructor (public form: Form) {}

  async load (actions: Action[] = [], data: QuestionDatum[] = [], conditionTags: ConditionTagInterface = { respondent: [], section: [], survey: [] }, respondentFills: RespondentFill[] = [], baseRespondentConditionTags: RespondentConditionTag[] = []) {
    this.manager = new InterviewManager(this.interview, this.form, actions, data, conditionTags, respondentFills, baseRespondentConditionTags)
    return this.manager.initialize()
  }

  async next (expectedLocation?: SimpleLocation): Promise<this> {
    await this.action(this.simpleAction(AT.next))
    if (expectedLocation) {
      this.validateLocation(expectedLocation)
    }
    return this
  }

  async previous (expectedLocation?: SimpleLocation): Promise<this> {
    await this.action(this.simpleAction(AT.previous))
    if (expectedLocation) {
      this.validateLocation(expectedLocation)
    }
    return this
  }

  validateLocation (desiredLocation: SimpleLocation) {
    const currentLoc = this.manager.location
    desiredLocation.section = desiredLocation.section || 0
    desiredLocation.sectionRepetition = desiredLocation.sectionRepetition || 0
    expect(currentLoc.page).to.equal(desiredLocation.page, `We aren't at the correct page`)
    expect(currentLoc.section).to.equal(desiredLocation.section, `We aren't at the correct section`)
    expect(currentLoc.sectionRepetition).to.equal(desiredLocation.sectionRepetition, `We aren't at the correct sectionRepetition`)
    if (desiredLocation.sectionFollowUpRepetition != null) {
      expect(currentLoc.sectionFollowUpRepetition).to.equal(desiredLocation.sectionFollowUpRepetition, `We aren't at the correct sectionFollowUpRepetition`)
    }
    if (desiredLocation.sectionFollowUpDatumId) {
      expect(currentLoc.sectionFollowUpDatumId).to.equal(desiredLocation.sectionFollowUpDatumId, `We aren't at the correct sectionFollowUpDatumId`)
    }
  }

  makeAction (questionId: string, actionType: string, payload: ActionPayload): Action {
    let action = new Action()
    action.actionType = actionType
    action.payload = payload
    action.questionId = questionId
    action.createdAt = moment().add(this.n, 'seconds')
    this.n++
    return action
  }

  simpleAction (actionType: string): Action {
    const action = new Action()
    action.actionType = actionType
    action.createdAt = moment().add(this.n, 'seconds')
    this.n++
    return action
  }

  async action (action: Action): Promise<this> {
    await this.manager.pushAction(action)
    return this
  }

  async selectChoice (choiceVal: string, isSelect: boolean = true): Promise<this> {
    const loc = this.manager.location
    try {
      let questions = this.manager.getPageQuestions(loc.section, loc.sectionRepetition, loc.sectionFollowUpDatumId, loc.page)
      let question = questions.find(q => {
        return !!q.choices.find(c => c.choice.val === choiceVal)
      })
      let choice = question.choices.find(c => c.choice.val === choiceVal).choice
      if (question) {
        let action = this.makeAction(question.id, isSelect ? AT.select_choice : AT.deselect_choice, {
          name: choice.val,
          val: choice.val,
          choice_id: choice.id
        })
        await this.action(action)
        return this
      } else {
        throw Error('No question with this choice found')
      }
    } catch (err) {
      throw Error(`Couldn't select choice, ${choiceVal}` + err)
    }
    return this
  }

  async selectNChoice (n = 0): Promise<this> {
    const questions = this.manager.getCurrentPageQuestions()
    if (!questions.length) throw Error('Empty page')
    try {
      return this.selectChoice(questions[0].choices[n].choice.val)
    } finally {}
  }

  matchConditionTags (expectedTags: string[]) {
    expectedTags = Array.from(new Set(expectedTags))
    expectedTags.sort()
    const currentTags = Array.from(this.manager.getConditionTagSet(this.manager.location.sectionRepetition, this.manager.location.sectionFollowUpDatumId))
    currentTags.sort()
    expect(currentTags).to.deep.equal(expectedTags, 'Not all tags were found')
  }

  hasNoConditionAssignmentErrors () {
    expect(this.manager.conditionAssignmentErrors, 'Condition assignment errors were found').to.be.empty
  }

}
