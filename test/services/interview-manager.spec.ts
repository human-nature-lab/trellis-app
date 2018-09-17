import InterviewManager from '../../src/components/interview/classes/InterviewManager'
import Interview from "../../src/entities/trellis/Interview";
import {forms, studyId, respondentId, formId, rosterId, editRosterId, firstPageRosterIds} from "../testing-ids";
import SurveyService from "../../src/services/survey/index";
import InterviewService from "../../src/services/interview/InterviewService";
import FormService from "../../src/services/form/FormService";
import RespondentService from "../../src/services/respondent/RespondentService";
import AT from '../../src/static/action.types'

import {expect} from 'chai'
import Form from "../../src/entities/trellis/Form";
import {deepCompareEntities, isSorted, j, strip, timestamps} from "./helpers";
import Skip from "../../src/entities/trellis/Skip";
import Action from "../../src/entities/trellis/Action";
import {ActionPayload} from "../../src/components/interview/services/actions/DatumOperations";
import Question from "../../src/entities/trellis/Question";
import {InterviewLocation} from "../../src/components/interview/services/InterviewNavigator";
import QuestionDatum from "../../src/entities/trellis/QuestionDatum";
import {ConditionTagInterface} from "../../src/services/interview/InterviewDataInterface";
import moment from 'moment'

interface SimpleLocation {
  section: number
  sectionRepetition: number
  sectionFollowUpRepetition: number
  page: number
}

async function createNewSurvey (formId: string): Promise<Interview> {
  let survey = await SurveyService.create(studyId, respondentId, formId)
  return await InterviewService.create(survey.id)
}

function validateLocation (currentLoc: InterviewLocation, desiredLocation: SimpleLocation) {
  expect(currentLoc.page).to.equal(desiredLocation.page, `We are't at the correct page`)
  expect(currentLoc.section).to.equal(desiredLocation.section, `We aren't at the correct section`)
  expect(currentLoc.sectionRepetition).to.equal(desiredLocation.sectionRepetition, `We aren't at the correct sectionRepetition`)
  expect(currentLoc.sectionFollowUpRepetition).to.equal(desiredLocation.sectionFollowUpRepetition, `We aren't at the correct sectionFollowUpRepetition`)
}

function validateDatum (initialDatum: object[], compareDatum: QuestionDatum[]) {
  deepCompareEntities(initialDatum, compareDatum)
}

function validateConditionTags (initialTags: ConditionTagInterface, currentConditionTags: ConditionTagInterface) {
  deepCompareEntities(initialTags, currentConditionTags, {
    SectionConditionTag: o => strip(o, timestamps),
    RespondentConditionTag: o => strip(o, timestamps),
    SurveyConditionTag: o => strip(o, timestamps)
  })
}

function stepThroughRandomly (nSteps: number, manager: InterviewManager, locationSequence: SimpleLocation[], currentLocIndex: number = 0, validateData: boolean = true) {
  const initialDatum = manager['data'].data.map(d => d.copy())
  const initialConditionTags = {
    respondent: manager['data'].conditionTags.respondent.map(c => c.copy()),
    section: manager['data'].conditionTags.section.map(c => c.copy()),
    survey: manager['data'].conditionTags.survey.map(c => c.copy())
  }
  for (let n = 0; n < nSteps; n++) {
    let moveForward = Math.random() > .5
    let beforeLoc = manager.locToNumber(manager.location)
    if (moveForward && currentLocIndex !== locationSequence.length - 1) {
      currentLocIndex++
      manager.next()
      console.log('moving forward', currentLocIndex, `from: ${beforeLoc}, to: ${manager.locToNumber(manager.location)}`)
    } else if (currentLocIndex !== 0) {
      // Move backward, but only if we aren't at the beginning
      currentLocIndex--
      manager.previous()
      console.log('moving backward', currentLocIndex, `from: ${beforeLoc}, to: ${manager.locToNumber(manager.location)}`)
    }
    if (validateData) {
      validateDatum(initialDatum, manager['data'].data)
      validateConditionTags(initialConditionTags, manager['data'].conditionTags)
    }
    validateLocation(manager.location, locationSequence[currentLocIndex])
  }
}

const now = moment()
function makeAction (questionId: string, actionType: string, payload: ActionPayload) {
  let action = new Action()
  action.actionType = actionType
  action.payload = payload
  action.questionId = questionId
  action.createdAt = moment(now).add(1, 's')
  return action
}

function selectChoice (manager: InterviewManager, choiceVal: string): Action {
  let questions = manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
  let question = questions.find(q => {
    return !!q.choices.find(c => c.choice.val === choiceVal)
  })
  let choice = question.choices.find(c => c.choice.val === choiceVal).choice
  if (question) {
    let action = makeAction(question.id, AT.select_choice, {
      name: choice.val,
      val: choice.val,
      choice_id: choice.id
    })
    manager.pushAction(action)
    return action
  } else {
    throw Error('No question with this choice found')
  }
}

function selectNChoice (manager: InterviewManager, n = 0): Action {
  let question = getCurrentQuestions(manager)[0]
  let choice = question.choices[n].choice
  return selectChoice(manager, choice.val)
}

function simpleActionPush (manager: InterviewManager, type: string) {
  let action = new Action()
  action.actionType = type
  manager.pushAction(action)
}

function getCurrentQuestions (manager: InterviewManager): Question[] {
  return manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
}

function setupInterviewManager (formId: string) {
  let interview
  return createNewSurvey(formId).then(int => {
    interview = int
    return Promise.all([
      InterviewService.getActions(interview.id),
      InterviewService.getData(interview.id),
      FormService.getForm(formId),
      RespondentService.getRespondentFillsById(interview.survey.respondentId)
    ])
  }).then(res => {
    const [actions, data, form, fills] = res
    return new InterviewManager(interview, form, actions, data.data, data.conditionTags, fills)
  })
}

export default function () {
  describe('InterviewManager', function (this:any) {
    this.timeout(60 * 1000)
    //
    // describe('Loading', () => {
    //   it('should sort all sections of the form correctly', async () => {
    //     for (let id of [forms.firstQuestionSkipped, formId]) {
    //       const manager = await setupInterviewManager(id)
    //       manager.initialize()
    //       const sections = manager.blueprint.sections
    //       const sectionSorted = isSorted(sections, s => s.formSections[0].sortOrder)
    //       expect(sectionSorted, 'Sections are not sorted correctly').to.be.true
    //       for (let section of sections) {
    //         const questionGroupSorted = isSorted(section.questionGroups, g => g.sectionQuestionGroup.questionGroupOrder)
    //         expect(questionGroupSorted, 'Question groups are not sorted correctly').to.be.true
    //         for (let page of section.questionGroups) {
    //           const questionsSorted = isSorted(page.questions, q => q.sortOrder)
    //           expect(questionsSorted, 'Questions are not sorted correctly').to.be.true
    //           for (let question of page.questions) {
    //             let choicesSorted = isSorted(question.choices, c => c.sortOrder)
    //             expect(choicesSorted, 'Choices are not sorted correctly').to.be.true
    //           }
    //         }
    //       }
    //     }
    //   })
    //   it('should load interview data correctly')
    //   it('should handle loading correctly')
    // })

    describe('Prefill', () => {
      let manager
      beforeEach(async () => {
        manager = await setupInterviewManager(forms.rosterPrefill)
        manager.initialize()
      })
      it('should handle prefill actions for the first question', () => {
        validateLocation(manager.location, {section: 0, sectionRepetition: 0, sectionFollowUpRepetition: 0, page: 0})
        let questions = manager.getCurrentPageQuestions()
        expect(questions.length).to.equal(1, 'There are no questions here')
        let q = questions[0]
        expect(q.datum.data.length).to.equal(3, 'All roster rows are not present')
        let rosterIds = q.datum.data.map(d => d.rosterId)
        expect(rosterIds).to.include(firstPageRosterIds, 'All roster ids were not inclued on the first page')
        simpleActionPush(manager, AT.next)
        simpleActionPush(manager, AT.next)
      })
      it('should handle prefill actions in the middle', () => {
        validateLocation(manager.location, {section: 0, sectionRepetition: 0, sectionFollowUpRepetition: 0, page: 2})
      })
      it('should handle prefill actions at the end', () => {
        validateLocation(manager.location, {section: 0, sectionRepetition: 0, sectionFollowUpRepetition: 0, page: 3})
      })
    })

    // describe('Navigation', () => {
    //   it('should handle moving backward a forward correctly', async ()  => {
    //     const manager = await setupInterviewManager(forms.conditionAssignment)
    //     manager.initialize()
    //     expect(manager.location.page).to.equal(0, 'We should start on the first page')
    //     selectChoice(manager, '2')
    //     simpleActionPush(manager, AT.next)
    //     expect(manager.location.page).to.equal(1, 'We should be on the second page')
    //     simpleActionPush(manager, AT.previous)
    //     expect(manager.location.page).to.equal(0, 'We should be back on the first page')
    //   })
    // })
    //
    // describe('Skips', () => {
    //   it('should handle skips on the first question correctly', async () => {
    //     const manager = await setupInterviewManager(forms.firstQuestionSkipped)
    //     const firstLocation = j(manager.location)
    //     manager.initialize()
    //     expect(manager.blueprint).to.be.an.instanceOf(Form)
    //     expect(manager.blueprint.sections[0].questionGroups[0].skips.length).to.be.greaterThan(0, 'No skips defined on the first page')
    //     const skip: Skip = manager.blueprint.sections[0].questionGroups[0].skips[0]
    //     expect(skip.showHide).to.equal(true, 'First skip should be show')
    //     expect(firstLocation).to.not.deep.equal(manager.location, 'The first page should have been skipped')
    //   })
    //   it('should handle skips in repeated sections')
    //   it('should handle skipping the last question')
    // })
    //
    // describe('Lifecycle', () => {
    //   it('should handle correctly assign conditions after changing responses and navigating', async () => {
    //     const manager = await setupInterviewManager(forms.conditionAssignment)
    //     manager.initialize()
    //     let questions = getCurrentQuestions(manager)
    //     let questionOne = questions[0]
    //     let action = selectChoice(manager, '1')
    //     simpleActionPush(manager, AT.next)
    //     let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
    //     expect(conditionTags).to.include('is_one', `condition tags should include condition, 'is_one'`).and.not.include('is_two', `condition tags should not include condition, 'is_two'`)
    //     simpleActionPush(manager, AT.previous)
    //     selectChoice(manager, '2')
    //     simpleActionPush(manager, AT.next)
    //     conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
    //     expect(conditionTags).to.include('is_two', `condition tags should include condition, 'is_two'`).and.not.include('is_one', `condition tags should not include condition, 'is_one'`)
    //     simpleActionPush(manager, AT.next)
    //   })
    //   it('should handle repeated sections', async () => {
    //     const manager = await setupInterviewManager(forms.repeatedSections)
    //     manager.initialize()
    //     simpleActionPush(manager, AT.next)
    //     expect(manager.location.page).to.equal(1, `We should be on the second page`)
    //     selectNChoice(manager, 0)
    //     simpleActionPush(manager, AT.next)
    //     let question = getCurrentQuestions(manager)[0]
    //     let action = makeAction(question.id, AT.add_roster_row, {
    //       roster_id: rosterId,
    //       name: question.varName,
    //       val: rosterId
    //     })
    //     manager.pushAction(action)
    //     action = makeAction(question.id, AT.add_roster_row, {
    //       roster_id: editRosterId,
    //       name: question.varName,
    //       val: editRosterId
    //     })
    //     manager.pushAction(action)
    //     simpleActionPush(manager, AT.next)
    //     expect(manager.location.section).to.equal(1, `We should be on the second section`)
    //     expect(manager.location.page).to.equal(0, `We should be on the first page`)
    //     expect(manager.location.sectionFollowUpRepetition).to.equal(0, `We should be on the first repetition`)
    //     selectChoice(manager, 'cat')
    //     simpleActionPush(manager, AT.next)
    //     expect(manager.location.sectionFollowUpRepetition).to.equal(1, `We should be on the second repetition`)
    //     expect(manager.location.page).to.equal(0, `We should be at the first page of the section`)
    //     selectChoice(manager, 'dog')
    //     simpleActionPush(manager, AT.next)
    //     expect(manager.location.sectionFollowUpRepetition).to.equal(1, `We should still be on the second repetition`)
    //     expect(manager.location.page).to.equal(1, `This page should not be skipped this time`)
    //     const repeatedLocationSequence = [
    //       [0, 0, 0, 0],
    //       [0, 0, 0, 1],
    //       [0, 0, 0, 2],
    //       [1, 0, 0, 0],
    //       [1, 0, 1, 0],
    //       [1, 0, 1, 1]
    //     ].map(s => ({section: s[0], sectionRepetition: s[1], sectionFollowUpRepetition: s[2], page: s[3]}))
    //     stepThroughRandomly(200, manager, repeatedLocationSequence, 5)
    //   })
    // })

    describe('Storage', () => {
      it('should save actions when they happen')
      it('should save data eventually')
      it('should save data and actions before leaving')
    })
  })
}
