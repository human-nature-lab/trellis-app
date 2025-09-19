import InterviewManager from '../../src/components/interview/classes/InterviewManager'
import Interview from '../../src/entities/trellis/Interview'
import { InterviewController } from '../InterviewController'
import { randomizedPages, randomizedQuestions } from '../test-forms'
import {
  forms,
  studyId,
  respondentId,
  formId,
  rosterId,
  editRosterId,
  firstPageRosterIds,
  prefillRespondentId,
  middlePageRosterIds,
  lastPageRosterIds,
  respondentId3,
  edgeIds,
  reloadConditionTagSurveyId,
  respondentId2,
} from '../testing-ids'
import SurveyService from '../../src/services/survey/index'
import InterviewService from '../../src/services/interview'
import AT from '../../src/static/action.types'
import QT from '../../src/static/question.types'
import { createForm, createChoiceQuestion } from './util'

import { expect } from 'chai'
import './globals'
import { deepCompareEntities, isSorted, j, strip, timestamps } from './helpers'
import Action from '../../src/entities/trellis/Action'
import { ActionPayload } from '../../src/components/interview/services/actions/DatumOperations'
import Question from '../../src/entities/trellis/Question'
import QuestionDatum from '../../src/entities/trellis/QuestionDatum'
import { ConditionTagInterface } from '../../src/services/interview/InterviewDataInterface'
import { locToNumber } from '../../src/components/interview/services/LocationHelpers'
import { addSeconds } from 'date-fns'
import InterviewLoader from '../../src/components/interview/services/InterviewLoader'
import Form from '../../src/entities/trellis/Form'
import Skip from '../../src/entities/trellis/Skip'
import Measurement from '../../src/classes/Measurement'
import EdgeService from '../../src/services/edge'
import { v4 as uuidv4 } from 'uuid'

interface SimpleLocation {
  section?: number
  sectionRepetition?: number
  sectionFollowUpRepetition?: number
  sectionFollowUpDatumId?: string
  page: number
}

async function createNewSurvey (formId: string, rId: string, sId: string): Promise<Interview> {
  const survey = await SurveyService.create(sId || studyId, rId || respondentId, formId)
  return await InterviewService.create(survey.id)
}

function validateLocation (manager: InterviewManager, desiredLocation: SimpleLocation) {
  const currentLoc = manager.location
  desiredLocation.section = desiredLocation.section || 0
  desiredLocation.sectionRepetition = desiredLocation.sectionRepetition || 0
  expect(currentLoc.section).to.equal(desiredLocation.section, 'We aren\'t at the correct section')
  expect(currentLoc.page).to.equal(desiredLocation.page, 'We aren\'t at the correct page')
  expect(currentLoc.sectionRepetition).to.equal(desiredLocation.sectionRepetition, 'We aren\'t at the correct sectionRepetition')
  if (desiredLocation.sectionFollowUpRepetition != null) {
    expect(currentLoc.sectionFollowUpRepetition).to.equal(desiredLocation.sectionFollowUpRepetition, 'We aren\'t at the correct sectionFollowUpRepetition')
  }
  if (desiredLocation.sectionFollowUpDatumId) {
    expect(currentLoc.sectionFollowUpDatumId).to.equal(desiredLocation.sectionFollowUpDatumId, 'We aren\'t at the correct sectionFollowUpDatumId')
  }
  const conditionTags = manager.getAllConditionTags()
  const conditionTagSet = new Set(conditionTags)
  expect(conditionTags.length).to.equal(conditionTagSet.size, 'Expected no duplicate condition tags')
}

function validateDatum (initialDatum: object[], compareDatum: QuestionDatum[]) {
  deepCompareEntities(initialDatum, compareDatum)
}

function validateConditionTags (initialTags: ConditionTagInterface, currentConditionTags: ConditionTagInterface) {
  deepCompareEntities(initialTags, currentConditionTags, {
    SectionConditionTag: o => strip(o, timestamps),
    RespondentConditionTag: o => strip(o, timestamps),
    SurveyConditionTag: o => strip(o, timestamps),
  })
}

async function stepThroughRandomly (nSteps: number, manager: InterviewManager, locationSequence: SimpleLocation[], currentLocIndex = 0, validateData = true) {
  const initialDatum = manager.data.data.map(d => d.copy())
  const initialConditionTags = {
    respondent: manager.data.conditionTags.respondent.map(c => c.copy()),
    section: manager.data.conditionTags.section.map(c => c.copy()),
    survey: manager.data.conditionTags.survey.map(c => c.copy()),
  }
  for (let n = 0; n < nSteps; n++) {
    const moveForward = Math.random() > 0.5
    const beforeLoc = locToNumber(manager.location)
    if (moveForward && currentLocIndex !== locationSequence.length - 1) {
      currentLocIndex++
      await manager.next()
      console.log('moving forward', currentLocIndex, `from: ${beforeLoc}, to: ${locToNumber(manager.location)}`)
    } else if (currentLocIndex !== 0) {
      // Move backward, but only if we aren't at the beginning
      currentLocIndex--
      await manager.previous()
      console.log('moving backward', currentLocIndex, `from: ${beforeLoc}, to: ${locToNumber(manager.location)}`)
    }
    if (validateData) {
      validateDatum(initialDatum, manager.data.data)
      validateConditionTags(initialConditionTags, manager.data.conditionTags)
    }
    validateLocation(manager, locationSequence[currentLocIndex])
  }
}

let n = 0
function makeAction (questionId: string, actionType: string, payload: ActionPayload) {
  const action = new Action()
  action.actionType = actionType
  action.payload = payload
  action.questionId = questionId
  action.createdAt = addSeconds(new Date(), n)
  n++
  return action
}

async function selectRespondent (manager: InterviewManager, respondentId: string, pushAction = false): Promise<Action> {
  const l = manager.location
  const questions = manager.getPageQuestions(l.section, l.sectionRepetition, l.sectionFollowUpDatumId, l.page)
  if (questions.length > 1) {
    throw 'More than one question on this page'
  }
  const q = questions[0]
  if (q.questionType.id !== QT.relationship) {
    throw 'Question is not a relationship type question'
  }
  const edges = await EdgeService.createEdges([{
    source_respondent_id: manager.interview.survey.respondentId,
    target_respondent_id: respondentId,
  }])
  const action = makeAction(q.id, AT.add_edge, {
    edge_id: edges[0].id,
    val: edges[0].id,
    name: q.varName,
  })
  if (pushAction) manager.pushAction(action)
  return action
}

function selectChoice (manager: InterviewManager, choiceVal: string, isSelect = true): Action {
  try {
    const questions = manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
    const question = questions.find(q => {
      return !!q.choices.find(c => c.choice.val === choiceVal)
    })
    const choice = question.choices.find(c => c.choice.val === choiceVal).choice
    if (question) {
      const action = makeAction(question.id, isSelect ? AT.select_choice : AT.deselect_choice, {
        name: choice.val,
        val: choice.val,
        choice_id: choice.id,
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
  const question = getCurrentQuestions(manager)[0]
  const choice = question.choices[n].choice
  return selectChoice(manager, choice.val)
}

function simpleActionPush (manager: InterviewManager, type: string) {
  const action = new Action()
  action.actionType = type
  return manager.pushAction(action)
}

async function next (manager: InterviewManager, expectedLocation?: SimpleLocation) {
  const res = await simpleActionPush(manager, AT.next)
  if (expectedLocation) {
    validateLocation(manager, expectedLocation)
  }
  return res
}
async function prev (manager: InterviewManager, expectedLocation?: SimpleLocation) {
  const res = await simpleActionPush(manager, AT.previous)
  if (expectedLocation) {
    validateLocation(manager, expectedLocation)
  }
  return res
}

function getCurrentQuestions (manager: InterviewManager): Question[] {
  return manager.getPageQuestions(manager.location.section, manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId, manager.location.page)
}

export async function setupInterviewManager (formId: string, rId?: string, sId?: string, customActions?: Action[]) {
  const interview = await createNewSurvey(formId, rId, sId)
  const res = await InterviewLoader.loadInterview(interview.id)
  let { form, actions, data, respondentFills, baseRespondentConditionTags } = res
  if (customActions) {
    actions = customActions
  }
  return new InterviewManager(interview, form, actions, data.data, data.conditionTags, respondentFills, baseRespondentConditionTags)
}

async function resumeSurvey (formId: string, rId: string, surveyId: string, customActions?: Action[]) {
  const interview = await InterviewService.create(surveyId)
  const res = await InterviewLoader.loadInterview(interview.id)
  let { form, actions, data, respondentFills, baseRespondentConditionTags } = res
  if (customActions) {
    actions = customActions
  }
  return new InterviewManager(interview, form, actions, data.data, data.conditionTags, respondentFills, baseRespondentConditionTags)
}

async function startRepeatedSections (n = 2): Promise<InterviewManager> {
  const manager = await setupInterviewManager(forms.repeatedSections)
  manager.setSaveActions(true)
  manager.setSaveData(true)
  await manager.initialize()
  validateLocation(manager, { page: 0 })
  await next(manager, { page: 1 })
  selectNChoice(manager, 1)
  await next(manager, { page: 2 })
  const question = getCurrentQuestions(manager)[0]
  const rosters = [rosterId, editRosterId]
  for (let i = 0; i < n; i++) {
    const action = makeAction(question.id, AT.add_roster_row, {
      roster_id: rosters[i % 2],
      name: question.varName,
      val: rosterId,
    })
    manager.pushAction(action)
  }
  return manager
}

export default function () {
  describe('InterviewManager', function (this:any) {
    this.timeout(60 * 1000)

    describe('Loading', () => {
      it('should sort all sections of the form correctly', async () => {
        for (const id of [forms.firstPageSkipped, formId]) {
          const manager = await setupInterviewManager(id)
          await manager.initialize()
          const sections = manager.blueprint.sections
          const sectionSorted = isSorted(sections, s => s.formSections[0].sortOrder)
          expect(sectionSorted, 'Sections are not sorted correctly').to.be.true
          for (const section of sections) {
            const questionGroupSorted = isSorted(section.questionGroups, g => g.sectionQuestionGroup.questionGroupOrder)
            expect(questionGroupSorted, 'Question groups are not sorted correctly').to.be.true
            for (const page of section.questionGroups) {
              const questionsSorted = isSorted(page.questions, q => q.sortOrder)
              expect(questionsSorted, 'Questions are not sorted correctly').to.be.true
              for (const question of page.questions) {
                const choicesSorted = isSorted(question.choices, c => c.sortOrder)
                expect(choicesSorted, 'Choices are not sorted correctly').to.be.true
              }
            }
          }
        }
      })
      it('TODO: should load interview data correctly')
      it('TODO: should handle loading correctly')
    })

    describe('Prefill', () => {
      function testRosters (manager, rosterIds) {
        const questions = manager.getCurrentPageQuestions()
        expect(questions.length).to.equal(1, 'There are no questions here')
        const q = questions[0]
        expect(q.datum.data.length).to.equal(3, 'All roster rows are not present')
        const foundRosterIds = q.datum.data.map(d => d.rosterId)
        expect(foundRosterIds).to.include.members(rosterIds, 'All roster ids were not inclued on the first page')
      }
      let manager
      beforeEach(async () => {
        manager = await setupInterviewManager(forms.rosterPrefill, prefillRespondentId)
        await manager.initialize()
      })
      it('should handle prefill actions for the first question', async () => {
        validateLocation(manager, { section: 0, page: 0 })
        testRosters(manager, firstPageRosterIds)
        await next(manager, { page: 1 })
        await next(manager, { page: 2 })
        await prev(manager, { page: 1 })
        await prev(manager, { page: 0 })
        testRosters(manager, firstPageRosterIds)
      })
      it('should handle prefill actions in the middle', async () => {
        validateLocation(manager, { section: 0, page: 0 })
        await next(manager, { page: 1 })
        await next(manager, { page: 2 })
        testRosters(manager, middlePageRosterIds)
        await next(manager, { page: 3 })
        await next(manager, { page: 4 })
        await prev(manager, { page: 3 })
        await prev(manager, { page: 2 })
        testRosters(manager, middlePageRosterIds)
      })
      it('should handle prefill actions at the end', async () => {
        validateLocation(manager, { section: 0, page: 0 })
        await next(manager, { page: 1 })
        await next(manager, { page: 2 })
        await next(manager, { page: 3 })
        selectNChoice(manager, 0)
        await next(manager, { page: 4 })
        testRosters(manager, lastPageRosterIds)
      })
    })

    describe('Navigation', () => {
      it('should not require you to press the next button twice after changing a skip condition', async () => {
        const manager = await setupInterviewManager(forms.conditionReassignment)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, 'c')
        await next(manager, { page: 1 })
        await prev(manager, { page: 0 })
        selectChoice(manager, 'c', false)
        selectChoice(manager, 'd')
        await next(manager, { page: 2 })
      })
      it('should start on the first page of a form if there are no actions', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        await manager.initialize()
        validateLocation(manager, { section: 0, page: 0 })
      })
      it('should stop at the first invalid question when loading', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment, respondentId3)
        await manager.initialize()
        validateLocation(manager, { section: 0, page: 0 })
        selectChoice(manager, '2')
        await next(manager, { section: 0, page: 1 })
        selectChoice(manager, 'one')
        await prev(manager, { section: 0, page: 0 })
        selectChoice(manager, '2', false)
        const actions = manager.actions.actions.map(a => a.copy())
        // console.log('actions', JSON.stringify(actions))
        const nManager = await setupInterviewManager(forms.conditionAssignment, respondentId3, studyId, actions)
        nManager.initialize()
        validateLocation(manager, { section: 0, page: 0 })
        selectChoice(manager, '2')
      })
      it('should handle moving backward and forward correctly', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, '2')
        await next(manager, { page: 1 })
        await prev(manager, { page: 0 })
      })

      it('should handle randomization of repeated sections', async () => {
        const manager = await setupInterviewManager(forms.randomFollowUpSections)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        const action1 = await selectRespondent(manager, respondentId2, false)
        const action2 = await selectRespondent(manager, respondentId3, false)
        action1.randomSortOrder = 1000000
        action2.randomSortOrder = 0
        manager.pushAction(action1)
        manager.pushAction(action2)
        const orderedSectionDatumIds = manager.getCurrentPageQuestions()[0].datum.data.sort((a, b) => a.randomSortOrder - b.randomSortOrder).map(d => d.id)
        let sectionFollowUpDatumId = orderedSectionDatumIds.shift()
        await next(manager, { page: 0, section: 1, sectionFollowUpDatumId })
        await next(manager, { page: 1, section: 1, sectionFollowUpDatumId })
        await next(manager, { page: 2, section: 1, sectionFollowUpDatumId })
        sectionFollowUpDatumId = orderedSectionDatumIds.shift()
        await next(manager, { page: 0, section: 1, sectionFollowUpDatumId })
      })

      it('should handle randomization of pages', async () => {
        // This is a statistical test to validate that running it 100 times gives us a decent  distribution of the order
        // of the pages
        let firstCount = 0
        const firstPageId = randomizedPages.sections[0].questionGroups[0].id
        for (let i = 0; i < 100; i++) {
          const controller = new InterviewController(randomizedPages)
          controller.interview.surveyId = uuidv4()
          await controller.load()
          validateLocation(controller.manager, { page: 0 })
          if (controller.manager.location.pageId === firstPageId) {
            firstCount++
          }
        }
        expect(firstCount).to.be.greaterThan(30).and.lessThan(70)
      })

      it('should handle randomization of questions', async () => {
        let firstCount = 0
        for (let i = 0; i < 100; i++) {
          const controller = new InterviewController(randomizedQuestions)
          controller.interview.surveyId = uuidv4()
          await controller.load()
          controller.validateLocation({ page: 0 })
          controller.manager.getCurrentPageQuestions()
          const firstQuestionId = controller.manager.getCurrentPageQuestions()[0].id
          if (firstQuestionId === 'first') {
            firstCount++
          }
        }
        expect(firstCount).to.be.greaterThan(30).and.lessThan(70)
      })

      it('should not be able to navigate backwards until forward navigation is complete', async () => {
        const manager = await setupInterviewManager(forms.conditionReassignment)
        manager.setSaveActions(true)
        manager.setSaveData(true)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, 'a')
        await manager.next()
        validateLocation(manager, { page: 1 })
        await manager.next()
        validateLocation(manager, { page: 2 })
        await manager.previous()
        await manager.previous()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, 'a', false)
        selectChoice(manager, 'd')
        await manager.next()
        validateLocation(manager, { page: 2 })
        await manager.previous()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, 'a')
        selectChoice(manager, 'd', false)
        await manager.next()
        await manager.previous()
        validateLocation(manager, { page: 0 })
        selectChoice(manager, 'a', false)
        selectChoice(manager, 'd')
        await manager.next()
        await manager.next()
        validateLocation(manager, { page: 2 })
      })

      describe('PERFORMANCE', () => {
        let manager
        before(async () => {
          manager = await setupInterviewManager(forms.largeRepeated)
          await manager.initialize()
        })

        it('should run quickly with repeated sections', async () => {
          validateLocation(manager, { page: 0, section: 0 })
          const rosterIds = firstPageRosterIds.concat(middlePageRosterIds.concat(lastPageRosterIds))
          for (const rosterId of rosterIds) {
            const a = makeAction(manager.getCurrentPageQuestions()[0].id, AT.add_roster_row, {
              roster_id: rosterId,
              val: rosterId,
              name: rosterId,
            })
            manager.pushAction(a)
          }
          await next(manager)
          let c = 0
          const nActions = 21
          const initialMeasurement = new Measurement('FillTiming')
          while (c < 1000) {
            initialMeasurement.startTick()
            for (let i = 0; i < nActions; i++) {
              selectNChoice(manager)
            }
            await next(manager)
            initialMeasurement.stopTick()
            if (manager.navigator.isAtEnd) {
              break
            }
            c++
          }
          initialMeasurement.end()
          let dir = 0
          const nextMeasurement = new Measurement('NextTiming')
          const prevMeasurement = new Measurement('PrevTiming')
          async function prevM () {
            prevMeasurement.startTick()
            await prev(manager)
            prevMeasurement.stopTick()
          }
          async function nextM () {
            nextMeasurement.startTick()
            await next(manager)
            nextMeasurement.stopTick()
          }
          for (let i = 0; i < 300; i++) {
            if (dir === 0) {
              // forward
              if (manager.navigator.isAtEnd) {
                dir = 1
                await prevM()
              } else {
                await nextM()
              }
            } else {
              // backward
              if (manager.navigator.isAtStart) {
                dir = 0
                await nextM()
              } else {
                await prevM()
              }
            }
          }
          nextMeasurement.end()
          prevMeasurement.end()
        })
      })
    })
    it('should handle basic navigation', async () => {
      const manager = await setupInterviewManager(forms.basicNavigation)
      await manager.initialize()
      validateLocation(manager, { page: 0 })
      await next(manager, { page: 1 })
      selectNChoice(manager)
      await next(manager, { section: 1, page: 0 })
      await next(manager, { section: 1, page: 1 })
      await prev(manager)
      await prev(manager, { page: 1 })
      selectNChoice(manager)
      selectNChoice(manager)
      await next(manager, { section: 1, page: 0 })
      await next(manager, { section: 1, page: 1 })
    })
    it('should be able to move backward even if the current page has invalid responses', async () => {
      const manager = await setupInterviewManager(forms.conditionAssignment)
      await manager.initialize()
      validateLocation(manager, { page: 0 })
      selectChoice(manager, '2')
      await next(manager, { page: 1 })
      await prev(manager, { page: 0 })
      await next(manager, { page: 1 })
      selectChoice(manager, 'one')
      await next(manager, { page: 2 })
      selectChoice(manager, 'yes')
      await prev(manager, { page: 1 })
      selectChoice(manager, 'one', false)
      await prev(manager, { page: 0 })
    })
    describe('Skips', () => {
      it('should skip pages correctly even with backward movement', async () => {
        const manager = await setupInterviewManager(forms.skipWithPrevious)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        await next(manager, { section: 1, page: 0 })
        selectNChoice(manager, 0)
        await next(manager, { section: 1, page: 1 })
        const action = makeAction(manager.getCurrentPageQuestions()[0].id, AT.add_edge, {
          edge_id: edgeIds[0],
          val: edgeIds[0],
          name: 'edge',
        })
        manager.pushAction(action)
        await next(manager, { section: 1, page: 2 })
        selectChoice(manager, '2')
        await next(manager, { section: 1, page: 4 })
        await prev(manager, { section: 1, page: 2 })
        selectChoice(manager, '1')
        await next(manager, { section: 1, page: 3 })
      })
      it('should handle skips on the first question correctly', async () => {
        const manager = await setupInterviewManager(forms.firstPageSkipped)
        await manager.initialize()
        expect(manager.blueprint).to.be.an.instanceOf(Form)
        expect(manager.blueprint.sections[0].questionGroups[0].skips.length).to.be.greaterThan(0, 'No skips defined on the first page')
        const skip: Skip = manager.blueprint.sections[0].questionGroups[0].skips[0]
        expect(skip.showHide).to.equal(true, 'First skip should be show')
        validateLocation(manager, { section: 1, page: 0 })
      })
      it('should handle skips in repeated sections')
      it('should handle skipping the last question', async () => {
        const manager = await setupInterviewManager(forms.lastPageSkipped)
        await manager.initialize()
        validateLocation(manager, { section: 0, page: 0 })
        selectChoice(manager, 'skip')
        await next(manager, { section: 0, page: 1 })
        await next(manager, { section: 0, page: 1 })
      })
      it('should skip follow up sections without any data', async () => {
        const manager = await setupInterviewManager(forms.repeatedSections)
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        await next(manager, { page: 1 })
        selectChoice(manager, 'one')
        await next(manager, { page: 2 })
        await prev(manager, { page: 1 })
        selectChoice(manager, 'skip')
        await next(manager)
        expect(manager.navigator.isAtEnd).to.be.true
        validateLocation(manager, { section: 0, page: 1 })
      })
      it('should handle skipping the last question in a repeated section', async () => {
        const N = 5
        const manager = await startRepeatedSections(N)
        for (let i = 0; i < N; i++) {
          await next(manager, { section: 1, page: 0, sectionFollowUpRepetition: i })
          selectChoice(manager, 'cat')
        }
        expect(manager.navigator.isAtEnd, 'We aren\'t at the end of the survey').to.be.true
        await next(manager)
        expect(manager.navigator.isAtEnd, 'We aren\'t at the end of the survey').to.be.true
        selectChoice(manager, 'dog')
        expect(manager.navigator.isAtEnd, 'We should show we\'re at the end before evaluating condition tags').to.be.true
        await next(manager)
        expect(manager.navigator.isAtEnd, 'We should show the correct end now').to.be.true
        await prev(manager)
        expect(manager.navigator.isAtEnd, 'We now know we aren\'t at the end').to.be.false
      })
    })

    describe('Lifecycle', () => {
      it('should handle correctly assigning conditions after changing responses and navigating', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        await manager.initialize()
        selectChoice(manager, '1')
        await next(manager, { page: 2 })
        let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_one', 'condition tags should include condition, \'is_one\'').and.not.include('is_two', 'condition tags should not include condition, \'is_two\'')
        // manager._debugReplay = true
        await prev(manager, { page: 0 })
        selectChoice(manager, '2')
        await next(manager, { page: 1 })
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_two', 'condition tags should include condition, \'is_two\'').and.not.include('is_one', 'condition tags should not include condition, \'is_one\'')
        selectNChoice(manager, 0)
        await next(manager, { page: 2 })
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('skipped_maybe_was_evaluated', 'we don\'t have the correct conditions assigned now')
        selectNChoice(manager, 0)
        await next(manager, { page: 3 })
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('resp_was_assigned', '"resp_was_assigned" was not assigned correctly')
      })
      it('should handle repeated sections', async () => {
        const manager = await startRepeatedSections(2)
        await next(manager, { section: 1, page: 0, sectionFollowUpRepetition: 0 })
        selectChoice(manager, 'cat')
        await next(manager, { section: 1, page: 0, sectionFollowUpRepetition: 1 })
        selectChoice(manager, 'dog')
        await next(manager, { section: 1, page: 1, sectionFollowUpRepetition: 1 })
        await prev(manager, { section: 1, page: 0, sectionFollowUpRepetition: 1 })
        expect(manager.data.conditionTags.section.length).to.equal(1, 'We should have 1 section condition tags assigned at this point')
        await next(manager, { section: 1, page: 1, sectionFollowUpRepetition: 1 })
        expect(manager.data.conditionTags.section.length).to.equal(1, 'We should have 1 section condition tags assigned at this point')
        const repeatedLocationSequence = [
          [0, 0, 0, 0],
          [0, 0, 0, 1],
          [0, 0, 0, 2],
          [1, 0, 0, 0],
          [1, 0, 1, 0],
          [1, 0, 1, 1],
        ].map(s => ({ section: s[0], sectionRepetition: s[1], sectionFollowUpRepetition: s[2], page: s[3] }))
        await stepThroughRandomly(200, manager, repeatedLocationSequence, 5, false)
      })
      it('should handle reloading forms and changing respondent condition tags', async () => {
        const manager = await resumeSurvey(forms.reloadConditionTag, respondentId, reloadConditionTagSurveyId)
        await manager.initialize()
        validateLocation(manager, { section: 0, page: 1 }) // Expect to start on the second (skipped) page
        let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('dont_skip', '"dont_skip" condition tag should be assigned initially').and.not.include('skip', '"skip" condition tag should ot be assigned')
        await prev(manager)
        selectChoice(manager, 'skip')
        await next(manager, { section: 0, page: 2 })
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('skip', '"skip" condition tag should be assigned now').and.not.include('dont_skip', '"dont_skip" condition tag should be removed now')
      })
      it('should not make duplicates of condition tags', async () => {
        const manager = await resumeSurvey(forms.reloadConditionTag, respondentId, reloadConditionTagSurveyId)
        await manager.initialize()
        validateLocation(manager, { section: 0, page: 1 }) // Expect to start on the second (skipped) page
        const conditionTags = manager.getAllConditionTags() // This is okay for non repeated sections
        const counts = conditionTags.reduce((agg, tag) => {
          if (!agg[tag]) {
            agg[tag] = 0
          }
          agg[tag]++
          return agg
        }, {})
        for (const key in counts) {
          expect(counts[key]).to.be.at.most(1, `${key} is a duplicate tag`)
        }
      })
    })

    describe('Storage', () => {
      describe('Condition tags', () => {
        it('should store respondent level condition tags', async () => {
          const tagName = 'resp_was_assigned'
          const manager = await setupInterviewManager(forms.conditionAssignment)
          manager.setSaveData(true)
          manager.setSaveActions(true)
          await manager.initialize()
          let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
          console.log('conditionTags', conditionTags)
          expect(conditionTags).to.not.include(tagName, 'The RCT already exists. Please reset DB or delete')
          validateLocation(manager, { section: 0, page: 0 })
          selectNChoice(manager, 1)
          await next(manager, { section: 0, page: 1, sectionFollowUpRepetition: 0, sectionRepetition: 0 })
          selectNChoice(manager, 0)
          await next(manager, { section: 0, page: 2, sectionFollowUpRepetition: 0, sectionRepetition: 0 })
          selectNChoice(manager, 0)
          await next(manager, { section: 0, page: 3, sectionFollowUpRepetition: 0, sectionRepetition: 0 })
          conditionTags = manager.navigator.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
          expect(conditionTags).to.include(tagName, 'The respondent condition tag was not assigned in memory')
          await manager.finalSave()
          const data = await InterviewService.getData(manager.interview.id)
          expect(data.conditionTags.respondent.length).to.be.greaterThan(0, 'No respondent condition tags assigned')
          const respondentConditionTags = data.conditionTags.respondent.map(rct => rct.conditionTag.name)
          expect(respondentConditionTags).to.include(tagName, 'The respondent condition tag was not assigned in the database')
          manager.destroy()
        })
      })
      it('should assign conditions on the last page', async () => {
        const condition = 'last_condition'
        const manager = await setupInterviewManager(forms.conditionAssignment)
        await manager.initialize()
        expect(manager.getAllConditionTags()).to.not.include(condition, `Condition tag,  '${condition}' should not be assigned initially`)
        validateLocation(manager, { page: 0 })
        selectNChoice(manager, 0)
        await next(manager, { page: 2 })
        selectNChoice(manager, 0)
        await next(manager, { page: 3 })
        selectNChoice(manager, 0)
        expect(manager.getAllConditionTags()).to.not.include(condition)
        await next(manager, { page: 3 })
        expect(manager.getAllConditionTags()).to.include(condition, `Condition tag, '${condition}' should be assigned on the last page`)
      })
      it('TODO: should only call save once when we exit')
      it('TODO: should save actions when they happen')
    })

    describe('bug/445-invalid-custom-skips', () => {
      it('should handle changing skips correctly', async () => {
        const vars = ['one', 'two', 'three']
        const def = {
          sections: [{
            pages: vars.map(v => ({
              questions: createChoiceQuestion(v, ['one']),
            })),
          }, {
            pages: [{
              skips: [{
                id: 1,
                custom_logic: `function showIf ({ data }) {
                  const { one, two, three } = data
                  let vals = one.allQuestionDatum.concat(two.allQuestionDatum.concat(three.allQuestionDatum))
                  vals = vals.filter(d => !!d)
                  console.log('hidden', 'vals.length', vals.length)
                  return vals.length < 3
                }`,
              }],
              questions: createChoiceQuestion('hidden', ['one']),
            }, {
              skips: [{
                id: 2,
                custom_logic: `function showIf ({ data }) {
                  const { one, two, three } = data
                  let vals = one.allQuestionDatum.concat(two.allQuestionDatum.concat(three.allQuestionDatum))
                  vals = vals.filter(d => !!d)
                  console.log('visible', 'vals.length', vals.length)
                  return vals.length >= 3
                }`,
              }],
              questions: createChoiceQuestion('visible', ['one']),
            }],
          }],
        }
        const form = createForm(def)
        console.log(form)
        const manager = new InterviewManager(new Interview(), form, [], [])
        await manager.initialize()
        validateLocation(manager, { page: 0 })
        console.log(JSON.stringify(manager.location), JSON.stringify(manager.navigator.pages))
        selectNChoice(manager, 0)
        await next(manager, { page: 1 })
        console.log(JSON.stringify(manager.location), JSON.stringify(manager.navigator.pages))
        selectNChoice(manager, 0)
        await next(manager, { page: 2 })
        console.log(JSON.stringify(manager.location), JSON.stringify(manager.navigator.pages))
        selectNChoice(manager, 0)
        console.log(JSON.stringify(manager.location), JSON.stringify(manager.navigator.pages))
        await next(manager, { section: 1, page: 1 })
      })
    })
  })
}
