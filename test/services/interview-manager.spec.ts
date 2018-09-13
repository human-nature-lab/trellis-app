import InterviewManager from '../../src/components/interview/classes/InterviewManager'
import Interview from "../../src/entities/trellis/Interview";
import {forms, studyId, respondentId, formId} from "../testing-ids";
import SurveyService from "../../src/services/survey/index";
import InterviewService from "../../src/services/interview/InterviewService";
import FormService from "../../src/services/form/FormService";
import RespondentService from "../../src/services/respondent/RespondentService";
import AT from '../../src/static/action.types'

import {expect} from 'chai'
import Form from "../../src/entities/trellis/Form";
import {isSorted, j} from "./helpers";
import Skip from "../../src/entities/trellis/Skip";
import Action from "../../src/entities/trellis/Action";
import {ActionPayload} from "../../src/components/interview/services/actions/DatumOperations";
import Question from "../../src/entities/trellis/Question";

async function createNewSurvey (formId: string): Promise<Interview> {
  let survey = await SurveyService.create(studyId, respondentId, formId)
  return await InterviewService.create(survey.id)
}

function makeAction (questionId: string, actionType: string, payload: ActionPayload) {
  let action = new Action()
  action.actionType = actionType
  action.payload = payload
  action.questionId = questionId
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
    describe('Loading', () => {
      it('should sort all sections of the form correctly', async () => {
        for (let id of [forms.firstQuestionSkipped, formId]) {
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
      it('should load interview data correct')
      it('should handle loading correctly')
      it('should handle prefill actions for the first question')
      it('should handle prefill actions in the middle')
    })
    describe('Storage', () => {
      it('should save actions when they happen')
      it('should save data eventually')
      it('should save data and actions before leaving')
    })
    describe('Lifecycle', () => {
      it('should handle skips on the first question correctly', async () => {
        const manager = await setupInterviewManager(forms.firstQuestionSkipped)
        const firstLocation = j(manager.location)
        manager.initialize()
        expect(manager.blueprint).to.be.an.instanceOf(Form)
        expect(manager.blueprint.sections[0].questionGroups[0].skips.length).to.be.greaterThan(0, 'No skips defined on the first page')
        const skip: Skip = manager.blueprint.sections[0].questionGroups[0].skips[0]
        expect(skip.showHide).to.equal(true, 'First skip should be show')
        expect(firstLocation).to.not.deep.equal(manager.location, 'The first page should have been skipped')
      })
      it('should handle correctly assign conditions after changing responses and navigating', async () => {
        const manager = await setupInterviewManager(forms.conditionAssignment)
        manager.initialize()
        let questions = getCurrentQuestions(manager)
        let questionOne = questions[0]
        let choiceOne = questionOne.choices.find(c => +c.choice.val === 1)
        let choiceTwo = questionOne.choices.find(c => +c.choice.val === 2)
        let action = selectChoice(manager, '1')
        manager.next()
        let conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_one').and.not.include('is_two')
        manager.previous()
        selectChoice(manager, '2')
        manager.next()
        conditionTags = manager.getConditionTagSet(manager.location.sectionRepetition, manager.location.sectionFollowUpDatumId)
        expect(conditionTags).to.include('is_two').and.not.include('is_one')
      })
      it('should handle repeated sections')
      it('should handle skips in repeated sections')
      it('should handle skipping the last question')
    })
  })
}
