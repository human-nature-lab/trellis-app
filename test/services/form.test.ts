import './mocha.globals'
import {expect} from 'chai'
import FormServiceCordova from '../../src/services/form/FormServiceCordova'
import FormServiceWeb from '../../src/services/form/FormServiceWeb'
import Form from '../../src/entities/trellis/Form'
import Translation from "../../src/entities/trellis/Translation";
import Section from "../../src/entities/trellis/Section";
import QuestionGroup from "../../src/entities/trellis/QuestionGroup";
import SectionQuestionGroup from "../../src/entities/trellis/SectionQuestionGroup";
import FormSection from "../../src/entities/trellis/FormSection";
import Skip from "../../src/entities/trellis/Skip";
import SkipConditionTag from "../../src/entities/trellis/SkipConditionTag";
import Question from "../../src/entities/trellis/Question";
import QuestionType from "../../src/entities/trellis/QuestionType";
import Choice from '../../src/entities/trellis/Choice';
import ConditionTag from "../../src/entities/trellis/ConditionTag";
import Parameter from "../../src/entities/trellis/Parameter";

let cordovaService = new FormServiceCordova()
let webService = new FormServiceWeb()

const testFormId = 'c98e78f8-1bcc-4afc-8e68-530374940213'
const studyId = '6a08c96a-fb80-4eae-9b2b-4d03d4b3235d'

function expectToHaveProperties(obj, props, errMsg = null) {
  for (let key of props) {
    expect(obj, `expected ${obj.constructor.name} to have ${key} defined`).to.have.property(key)
  }
}

function validateQuestion (question: Question) {
  expect(question).to.be.an.instanceOf(Question)
  expectToHaveProperties(question, [
    'sortOrder',
    'varName',
    'questionType',
    'questionTranslation',
    'choices',
    'assignConditionTags',
    'questionParameters'
  ])
  expect(question.questionType).to.be.an.instanceOf(QuestionType)
  expect(question.questionTranslation).to.be.an.instanceOf(Translation)
  for (let choice of question.choices) {
    expectToHaveProperties(choice, ['sortOrder', 'choice'])
    expect(choice.choice).to.be.an.instanceOf(Choice)
    expectToHaveProperties(choice.choice, ['id', 'val', 'choiceTranslation'])
  }
  for (let act of question.assignConditionTags) {
    expectToHaveProperties(act, ['id', 'logic', 'scope', 'conditionTag'])
    expect(act.conditionTag).to.be.an.instanceOf(ConditionTag)
    expectToHaveProperties(act.conditionTag, ['name'])
  }
  for (let parameter of question.questionParameters) {
    expectToHaveProperties(parameter, ['val', 'parameter'])
    expect(parameter.parameter).to.be.an.instanceOf(Parameter)
    expectToHaveProperties(parameter.parameter, ['name'])
  }
}

export default function () {
  describe('Form service', function (this: any) {
    this.timeout(60 * 1000)
    let services = [cordovaService, webService]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getStudyForms: should return a list of forms`, async () => {
          let forms = await service.getStudyForms(studyId)
          expect(forms.length).to.be.greaterThan(0,'No forms were returned for this study')
          // TODO: Validate the forms
        })
        it(`${service.constructor.name}.getForm: should return a form`, async () => {
          let form = await service.getForm(testFormId)
          expect(form).to.be.an.instanceOf(Form)
          expectToHaveProperties(form, ['id', 'version', 'isPublished', 'sections', 'nameTranslation'])
          expect(form.sections, 'sections were empty or not defined').to.be.an('array').and.not.be.empty
          expect(form.nameTranslation).to.be.an.instanceOf(Translation)
          for (let section of form.sections) {
            expect(section).to.be.an.instanceOf(Section)
            expectToHaveProperties(section, [
              'id',
              'questionGroups',
              'nameTranslation',
              'formSections'
            ])
            expect(section.nameTranslation).to.be.an.instanceOf(Translation)
            expect(section.questionGroups, 'Empty question groups').to.not.be.empty
            expect(section.formSections, 'Empty form sections').to.not.be.empty
            for (let group of section.questionGroups) {
              expect(group).to.be.an.instanceOf(QuestionGroup)
              expectToHaveProperties(group,[
                'id',
                'questions',
                'sectionQuestionGroup',
                'skips'
              ])
              expect(group.questions, 'empty questions').to.not.be.empty
              expect(group.sectionQuestionGroup).to.be.an.instanceOf(SectionQuestionGroup)
              for (let question of group.questions) {
                // TODO: Continue this
                validateQuestion(question)
              }
              for (let skip of group.skips) {
                expect(skip).to.be.an.instanceOf(Skip)
                expectToHaveProperties(skip, [
                  'showHide',
                  'anyAll',
                  'precedence',
                  'conditionTags'
                ])
                expect(skip.conditionTags).to.not.be.empty
                for (let cTag of skip.conditionTags) {
                  expect(cTag).to.be.an.instanceOf(SkipConditionTag)
                  expectToHaveProperties(cTag, [
                    'skipId',
                    'conditionTagName'
                  ])
                }
              }
            }
            for (let formSection of section.formSections) {
              expect(formSection).to.be.an.instanceOf(FormSection)
              expectToHaveProperties(formSection, [
                'id',
                'sortOrder',
                'isRepeatable',
                'maxRepetitions',
                'repeatPromptTranslationId',
                'followUpQuestionId'
              ])
            }
          }
        })
      }
    })
    describe('COMPARE', () => {
      // TODO: Compare these correctly
      it('getForm: should return identical versions of the form', function () {
        return Promise.all(services.map(s => s.getForm(testFormId))).then(res => {
          res.forEach(form => {
            expect(form).to.not.be.undefined
          })
          expect(JSON.parse(JSON.stringify(res[0]))).to.deep.equal(JSON.parse(JSON.stringify(res[1])), 'The forms are not the same')
        })
      })
      it('geStudyForms: should return the same forms', () => {
        return Promise.all(services.map(s => s.getStudyForms(studyId))).then(res => {
          res.forEach(forms => {
            expect(forms.length).to.be.greaterThan(0, 'No forms were returned for this study')
          })
          expect(res[0].length).to.equal(res[1].length, `The same number of forms weren't returned for both`)
          expect(JSON.parse(JSON.stringify(res[0]))).to.deep.include(JSON.parse(JSON.stringify(res[1])), `The forms weren't all the same`)
        })
      })
    })
  })
}
