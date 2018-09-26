import InterviewManager from '../../src/components/interview/classes/InterviewManager'
import Interview from "../../src/entities/trellis/Interview";
import {
  forms,
  studyId,
  respondentId,
  formId,
  rosterId,
  editRosterId,
  firstPageRosterIds,
  prefillRespondentId, middlePageRosterIds, lastPageRosterIds, respondentId3, edgeIds
} from "../testing-ids";
import SurveyService from "../../src/services/survey/index";
import InterviewService from "../../src/services/interview/InterviewService";
import FormService from "../../src/services/form/FormService";
import RespondentService from "../../src/services/respondent/RespondentService";
import AT from '../../src/static/action.types'

import {expect} from 'chai'
import './globals'
import {deepCompareEntities, isSorted, j, strip, timestamps} from "./helpers";
import Action from "../../src/entities/trellis/Action";
import {ActionPayload} from "../../src/components/interview/services/actions/DatumOperations";
import Question from "../../src/entities/trellis/Question";
import {InterviewLocation} from "../../src/components/interview/services/InterviewNavigator";
import QuestionDatum from "../../src/entities/trellis/QuestionDatum";
import {ConditionTagInterface} from "../../src/services/interview/InterviewDataInterface";
import {locToNumber} from "../../src/components/interview/services/LocationHelpers";
import moment from 'moment'
import Form from "../../src/entities/trellis/Form";
import Skip from "../../src/entities/trellis/Skip";

interface SimpleLocation {
  section?: number
  sectionRepetition?: number
  sectionFollowUpRepetition?: number
  page: number
}

async function createNewSurvey (formId: string, rId: string, sId: string): Promise<Interview> {
  let survey = await SurveyService.create(sId || studyId, rId ||respondentId, formId)
  return await InterviewService.create(survey.id)
}

function validateLocation (currentLoc: InterviewLocation, desiredLocation: SimpleLocation) {
  desiredLocation.section = desiredLocation.section || 0
  desiredLocation.sectionRepetition = desiredLocation.sectionRepetition || 0
  desiredLocation.sectionFollowUpRepetition = desiredLocation.sectionFollowUpRepetition || 0
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
    let beforeLoc = locToNumber(manager.location)
    if (moveForward && currentLocIndex !== locationSequence.length - 1) {
      currentLocIndex++
      manager.next()
      console.log('moving forward', currentLocIndex, `from: ${beforeLoc}, to: ${locToNumber(manager.location)}`)
    } else if (currentLocIndex !== 0) {
      // Move backward, but only if we aren't at the beginning
      currentLocIndex--
      manager.previous()
      console.log('moving backward', currentLocIndex, `from: ${beforeLoc}, to: ${locToNumber(manager.location)}`)
    }
    if (validateData) {
      validateDatum(initialDatum, manager['data'].data)
      validateConditionTags(initialConditionTags, manager['data'].conditionTags)
    }
    validateLocation(manager.location, locationSequence[currentLocIndex])
  }
}

let n = 0
function makeAction (questionId: string, actionType: string, payload: ActionPayload) {
  let action = new Action()
  action.actionType = actionType
  action.payload = payload
  action.questionId = questionId
  action.createdAt = moment().add(n, 'seconds')
  n++
  return action
}

function selectChoice (manager: InterviewManager, choiceVal: string, isSelect: boolean = true): Action {
  try {
    let questions = manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
    let question = questions.find(q => {
      return !!q.choices.find(c => c.choice.val === choiceVal)
    })
    let choice = question.choices.find(c => c.choice.val === choiceVal).choice
    if (question) {
      let action = makeAction(question.id, isSelect ? AT.select_choice : AT.deselect_choice, {
        name: choice.val,
        val: choice.val,
        choice_id: choice.id
      })
      manager.pushAction(action)
      return action
    } else {
      throw Error('No question with this choice found')
    }
  } catch (err) {
    throw Error(`Couldn't select choice, ${choiceVal}` + err)
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

function next (manager: InterviewManager): void {
  simpleActionPush(manager, AT.next)
}
function prev (manager: InterviewManager): void {
  simpleActionPush(manager, AT.previous)
}

function getCurrentQuestions (manager: InterviewManager): Question[] {
  return manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
}

function setupInterviewManager (formId: string, rId?: string, sId?: string, customActions?: Action[]) {
  let interview
  return createNewSurvey(formId, rId, sId).then(int => {
    interview = int
    return Promise.all([
      InterviewService.getActions(interview.id),
      InterviewService.getData(interview.id),
      FormService.getForm(formId),
      RespondentService.getRespondentFillsById(interview.survey.respondentId)
    ])
  }).then(res => {
    let [actions, data, form, fills] = res
    if (customActions) {
      actions = customActions
    }
    return new InterviewManager(interview, form, actions, data.data, data.conditionTags, fills)
  })
}

export default function () {
  describe('InterviewManager', function (this:any) {
    this.timeout(60 * 1000)

    describe('Loading', () => {
      it('should sort all sections of the form correctly', async () => {
        for (let id of [forms.firstPageSkipped, formId]) {
          const manager = await setupInterviewManager(id)
          manager.initialize()
          const sections = manager.blueprint.sections
          const sectionSorted = isSorted(sections, s => s.formSections[0].sortOrder)
          expect(sectionSorted, 'Sections are not sorted correctly').to.be.true
          for (let section of sections) {
            const questionGroupSorted = isSorted(section.questionGroups, g => g.sectionQuestionGroup.questionGroupOrder)
            expect(questionGroupSorted, 'Question groups are not sorted correctly').to.be.true
            for (let page of section.questionGroups) {
              const questionsSorted = isSorted(page.questions, q => q.sortOrder)
              expect(questionsSorted, 'Questions are not sorted correctly').to.be.true
              for (let question of page.questions) {
                let choicesSorted = isSorted(question.choices, c => c.sortOrder)
                expect(choicesSorted, 'Choices are not sorted correctly').to.be.true
              }
            }
          }
        }
      })
      it('should load interview data correctly')
      it('should handle loading correctly')
    })

    describe('Prefill', () => {
      function testRosters (manager, rosterIds) {
        let questions = manager.getCurrentPageQuestions()
        expect(questions.length).to.equal(1, 'There are no questions here')
        let q = questions[0]
        expect(q.datum.data.length).to.equal(3, 'All roster rows are not present')
        let foundRosterIds = q.datum.data.map(d => d.rosterId)
        expect(foundRosterIds).to.include.members(rosterIds, 'All roster ids were not inclued on the first page')
      }
      let manager
      beforeEach(async () => {
        manager = await setupInterviewManager(forms.rosterPrefill, prefillRespondentId)
        manager.initialize()
      })
      it('should handle prefill actions for the first question', () => {
        validateLocation(manager.location, {section: 0, page: 0})
        testRosters(manager, firstPageRosterIds)
        next(manager)
        validateLocation(manager.location, {page: 1})
        next(manager)
        validateLocation(manager.location, {page: 2})
        prev(manager)
        validateLocation(manager.location, {page: 1})
        prev(manager)
        validateLocation(manager.location, {page: 0})
        testRosters(manager, firstPageRosterIds)
      })
      it('should handle prefill actions in the middle', () => {
        validateLocation(manager.location, {section: 0, page: 0})
        next(manager)
        validateLocation(manager.location, {page: 1})
        next(manager)
        validateLocation(manager.location, {page: 2})
        testRosters(manager, middlePageRosterIds)
        next(manager)
        validateLocation(manager.location, {page: 3})
        next(manager)
        validateLocation(manager.location, {page: 4})
        prev(manager)
        validateLocation(manager.location, {page: 3})
        prev(manager)
        validateLocation(manager.location, {page: 2})
        testRosters(manager, middlePageRosterIds)
      })
      it('should handle prefill actions at the end', () => {
        validateLocation(manager.location, {section: 0, page: 0})
        next(manager)
        validateLocation(manager.location, {page: 1})
        next(manager)
        validateLocation(manager.location, {page: 2})
        next(manager)
        validateLocation(manager.location, {page: 3})
        selectNChoice(manager, 0)
        next(manager)
        validateLocation(manager.location, {page: 4})
        testRosters(manager, lastPageRosterIds)
      })
    })

    describe('Navigation', () => {
      it('should not require you to press the next button twice after changing a skip condition', async () => {
        const manager = await setupInterviewManager(forms.conditionReassignment)
        manager.initialize()
        validateLocation(manager.location, {page: 0})
        selectChoice(manager, 'c')
        next(manager)
        validateLocation(manager.location, {page: 1})
        prev(manager)
        validateLocation(manager.location, {section: 0, page: 0})
        selectChoice(manager, 'c', false)
        selectChoice(manager, 'd')
        next(manager)
        validateLocation(manager.location, {section: 0, page: 2})
      })
      it('should start on the first page of a form if there are no actions', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        manager.initialize()
        validateLocation(manager.location, {section: 0, page: 0})
      })
      it('should stop at the first invalid question when loading', async () => {
        let manager = await setupInterviewManager(forms.conditionAssignment, respondentId3)
        manager.initialize()
        validateLocation(manager.location, {section: 0, page: 0})
        selectChoice(manager, '2')
        next(manager)
        validateLocation(manager.location, {section: 0, page: 1})
        selectChoice(manager, 'one')
        prev(manager)
        validateLocation(manager.location, {section: 0, page: 0})
        selectChoice(manager, '2', false)
        let actions = manager['actions'].actions.map(a => a.copy())
        console.log('actions', JSON.stringify(actions))
        const nManager = await setupInterviewManager(forms.conditionAssignment, respondentId3, studyId, actions)
        nManager.initialize()
        validateLocation(manager.location, {section: 0, page: 0})
        selectChoice(manager, '2')
      })
      it('should handle moving backward and forward correctly', async ()  => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        manager.initialize()
        validateLocation(manager.location, {page: 0})
        selectChoice(manager, '2')
        next(manager)
        validateLocation(manager.location, {page: 1})
        prev(manager)
        validateLocation(manager.location, {page: 0})
      })
    })
    it('should be able to move backward even if the current page has invalid responses', async () => {
      const manager = await setupInterviewManager(forms.conditionAssignment)
      manager.initialize()
      validateLocation(manager.location, {page: 0})
      selectChoice(manager, '2')
      next(manager)
      validateLocation(manager.location, {page: 1})
      prev(manager)
      validateLocation(manager.location, {page: 0})
      next(manager)
      validateLocation(manager.location, {page: 1})
      selectChoice(manager, 'one')
      next(manager)
      validateLocation(manager.location, {page: 2})
      selectChoice(manager, 'yes')
      prev(manager)
      validateLocation(manager.location, {page: 1})
      selectChoice(manager, 'one', false)
      prev(manager)
      validateLocation(manager.location, {page: 0})
    })
    describe('Skips', () => {
      it('should skip pages correctly even with backward movement', async () => {
        let manager = await setupInterviewManager(forms.skipWithPrevious)
        manager.initialize()
        validateLocation(manager.location, {page: 0})
        simpleActionPush(manager, AT.next)
        validateLocation(manager.location, {section: 1, page: 0})
        selectNChoice(manager, 0)
        simpleActionPush(manager, AT.next)
        validateLocation(manager.location, {section: 1, page: 1})
        const action = makeAction(manager.getCurrentPageQuestions()[0].id, AT.add_edge, {
          edge_id: edgeIds[0],
          val: edgeIds[0],
          name: 'edge'
        })
        manager.pushAction(action)
        simpleActionPush(manager, AT.next)
        validateLocation(manager.location, {section: 1, page: 2})
        selectChoice(manager, '2')
        simpleActionPush(manager, AT.next)
        validateLocation(manager.location, {section: 1, page: 4})
        simpleActionPush(manager, AT.previous)
        validateLocation(manager.location, {section: 1, page: 2})
        selectChoice(manager, '1')
        simpleActionPush(manager, AT.next)
        validateLocation(manager.location, {section: 1, page: 3})
      })
      it('should handle skips on the first question correctly', async () => {
        const manager = await setupInterviewManager(forms.firstPageSkipped)
        manager.initialize()
        expect(manager.blueprint).to.be.an.instanceOf(Form)
        expect(manager.blueprint.sections[0].questionGroups[0].skips.length).to.be.greaterThan(0, 'No skips defined on the first page')
        const skip: Skip = manager.blueprint.sections[0].questionGroups[0].skips[0]
        expect(skip.showHide).to.equal(true, 'First skip should be show')
        validateLocation(manager.location, {section: 1, page: 0})
      })
      it('should handle skips in repeated sections')
      it('should handle skipping the last question', async () => {
        const manager = await setupInterviewManager(forms.lastPageSkipped)
        manager.initialize()
        validateLocation(manager.location, {section: 0, page: 0})
        selectChoice(manager, 'skip')
        next(manager)
        validateLocation(manager.location, {section: 0, page: 1})
        next(manager)
        validateLocation(manager.location, {section: 0, page: 1})
      })
      it('should skip follow up sections without any data', async () => {
        const manager = await setupInterviewManager(forms.repeatedSections)
        manager.initialize()
        validateLocation(manager.location, {page: 0})
        next(manager)
        validateLocation(manager.location, {page: 1})
        selectChoice(manager, 'one')
        next(manager)
        validateLocation(manager.location, {page: 2})
        prev(manager)
        selectChoice(manager, 'skip')
        next(manager)
        expect(manager.navigator.isAtEnd).to.be.true
        validateLocation(manager.location, {section: 0, page: 1})
      })
      it('should handle skipping the last question in a repeated section')
    })

    describe('Lifecycle', () => {
      it('should handle correctly assigning conditions after changing responses and navigating', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        manager.initialize()
        debugger
        selectChoice(manager, '1')
        next(manager)
        validateLocation(manager.location, {page: 2})
        let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_one', `condition tags should include condition, 'is_one'`).and.not.include('is_two', `condition tags should not include condition, 'is_two'`)
        // manager._debugReplay = true
        prev(manager)
        validateLocation(manager.location, {page: 0})
        selectChoice(manager, '2')
        next(manager)
        validateLocation(manager.location, {page: 1})
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_two', `condition tags should include condition, 'is_two'`).and.not.include('is_one', `condition tags should not include condition, 'is_one'`)
        selectNChoice(manager, 0)
        next(manager)
        validateLocation(manager.location, {page: 2})
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('was_assigned', 'r_condition was not assigned correct')
      })
      it('should handle repeated sections', async () => {
        const manager = await setupInterviewManager(forms.repeatedSections)
        manager.initialize()
        validateLocation(manager.location, {page: 0})
        next(manager)
        validateLocation(manager.location, {page: 1})
        selectNChoice(manager, 0)
        next(manager)
        validateLocation(manager.location, {page: 2})
        let question = getCurrentQuestions(manager)[0]
        let action = makeAction(question.id, AT.add_roster_row, {
          roster_id: rosterId,
          name: question.varName,
          val: rosterId
        })
        manager.pushAction(action)
        action = makeAction(question.id, AT.add_roster_row, {
          roster_id: editRosterId,
          name: question.varName,
          val: editRosterId
        })
        manager.pushAction(action)
        next(manager)
        validateLocation(manager.location, {section: 1, page: 0, sectionFollowUpRepetition: 0})
        selectChoice(manager, 'cat')
        next(manager)
        validateLocation(manager.location, {section: 1, page: 0, sectionFollowUpRepetition: 1})
        selectChoice(manager, 'dog')
        next(manager)
        validateLocation(manager.location, {section: 1, page: 1, sectionFollowUpRepetition: 1})
        prev(manager)
        validateLocation(manager.location, {section: 1, page: 0, sectionFollowUpRepetition: 1})
        expect(manager.data.conditionTags.section.length).to.equal(1, 'We should have 1 section condition tags assigned at this point')
        next(manager)
        validateLocation(manager.location, {section: 1, page: 1, sectionFollowUpRepetition: 1})
        expect(manager.data.conditionTags.section.length).to.equal(2, 'We should have 2 section condition tags assigned at this point')
        const repeatedLocationSequence = [
          [0, 0, 0, 0],
          [0, 0, 0, 1],
          [0, 0, 0, 2],
          [1, 0, 0, 0],
          [1, 0, 1, 0],
          [1, 0, 1, 1]
        ].map(s => ({section: s[0], sectionRepetition: s[1], sectionFollowUpRepetition: s[2], page: s[3]}))
        stepThroughRandomly(200, manager, repeatedLocationSequence, 5, false)
      })
    })

    describe('Storage', () => {
      describe('Condition tags', () => {
        it('should store respondent level condition tags', async () => {
          const tagName = 'resp_was_assigned'
          const manager = await setupInterviewManager(forms.conditionAssignment)
          manager.attachDataPersistSlave()
          manager.initialize()
          let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
          console.log('conditionTags', conditionTags)
          expect(conditionTags).to.not.include(tagName, 'The RCT already exists. Please reset DB or delete')
          validateLocation(manager.location, {section: 0, page: 0})
          selectNChoice(manager, 1)
          next(manager)
          validateLocation(manager.location, {section: 0, page: 1, sectionFollowUpRepetition: 0, sectionRepetition: 0})
          selectNChoice(manager, 0)
          next(manager)
          validateLocation(manager.location, {section: 0, page: 2, sectionFollowUpRepetition: 0, sectionRepetition: 0})
          selectNChoice(manager, 0)
          next(manager)
          validateLocation(manager.location, {section: 0, page: 3, sectionFollowUpRepetition: 0, sectionRepetition: 0})
          conditionTags = manager.navigator.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
          expect(conditionTags).to.include(tagName, 'The respondent condition tag was not assigned in memory')
          await manager.save()
          let data = await InterviewService.getData(manager.interview.id)
          expect(data.conditionTags.respondent.length).to.be.greaterThan(0, 'No respondent condition tags assigned')
          let respondentConditionTags = data.conditionTags.respondent.map(rct => rct.conditionTag.name)
          expect(respondentConditionTags).to.include(tagName, 'The respondent condition tag was not assigned in the database')
          manager.destroy()
        })
      })
      it('should assign conditions on the last page', async () => {
        throw Error('TODO') // TODO
      })
      it('should only call save once when we exit', async () => {
        throw Error('TODO') // TODO
      })
      it('should save actions when they happen')
      it('should save data eventually')
      it('should rebuild all the data and save before locking the survey')
      it('should save data and actions before leaving')
    })
  })
}
