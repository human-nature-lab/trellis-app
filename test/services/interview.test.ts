import './globals'
import {expect} from 'chai'

import InterviewServiceWeb from '../../src/services/interview/InterviewServiceWeb'
import InterviewServiceCordova from '../../src/services/interview/InterviewServiceCordova'
import Interview from '../../src/entities/trellis/Interview'
import User from '../../src/entities/trellis/User'
import Survey from '../../src/entities/trellis/Survey'
import Respondent from '../../src/entities/trellis/Respondent'
import Action from '../../src/entities/trellis/Action'
import InterviewDataInterface from "../../src/services/interview/InterviewDataInterface";
import QuestionDatum from "../../src/entities/trellis/QuestionDatum";
import Datum from "../../src/entities/trellis/Datum";
import RespondentConditionTag from "../../src/entities/trellis/RespondentConditionTag";
import SectionConditionTag from "../../src/entities/trellis/SectionConditionTag";
import ConditionTag from "../../src/entities/trellis/ConditionTag";
import SurveyConditionTag from "../../src/entities/trellis/SurveyConditionTag";
import {deepCompareEntities} from "./helpers";
import {interviewId} from "./testing-ids";

function j (w) {
  return JSON.parse(JSON.stringify(w))
}

export default function () {
  describe('Interview service', function (this: any) {
    this.timeout(60 * 1000)
    let services = [new InterviewServiceWeb(), new InterviewServiceCordova()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getInterview: should return an interview`, async () => {
          let interview = await service.getInterview(interviewId)
          expect(interview).to.be.an.instanceOf(Interview, `Service didn't return an instance of Interview`)
          expect(interview.survey).to.be.an.instanceOf(Survey, `Interview doesn't have survey defined`)
          expect(interview.user).to.be.an.instanceOf(User, `Interview doesn't have user defined`)
          expect(interview.survey.respondent).to.be.an.instanceOf(Respondent, `Survey doesn't have respondent defined`)
        })
        it(`${service.constructor.name}.getActions: should return an array of actions`, async () => {
          let actions: Action[] = await service.getActions(interviewId)
          expect(actions).to.be.a('array')
          expect(actions.length).to.be.greaterThan(0)
          expect(actions[0]).to.be.instanceOf(Action, `Didn't return instances of Action`)
        })
        it(`${service.constructor.name}.getData: should match the InterviewDataInterface`, async () => {
          let data: InterviewDataInterface = await service.getData(interviewId)
          expect(data.data.length).to.be.greaterThan(0, 'No question datum are defined here')
          expect(data.data).to.be.an('array')
          expect(data.conditionTags.respondent).to.be.an('array')
          expect(data.conditionTags.section).to.be.an('array')
          expect(data.conditionTags.survey).to.be.an('array')
          for (let questionDatum of data.data) {
            expect(questionDatum).to.be.an.instanceOf(QuestionDatum)
            expect(questionDatum.data).to.be.an('array')
            for (let datum of questionDatum.data) {
              expect(datum).to.be.an.instanceOf(Datum)
            }
          }
          let map = {
            'respondent': RespondentConditionTag,
            'section': SectionConditionTag,
            'survey': SurveyConditionTag
          }
          for (let name in map) {
            let type = map[name]
            for (let tag of data.conditionTags[name]) {
              expect(tag).to.be.an.instanceOf(type, name + ' is not instance of ' + type)
              expect(tag.conditionTag).to.be.an.instanceOf(ConditionTag, `${name} is not an instance of ConditionTag`)
            }
           }
        })
        it(`${service.constructor.name}.getPreload: should do something???`)
        it(`${service.constructor.name}.complete: should mark an interview as completed`)
        it(`${service.constructor.name}.create: should create a new interview for this survey`)
        it(`${service.constructor.name}.saveActions: should save actions to the database`)
        it(`${service.constructor.name}.saveData: should save things in the InterviewDeltaInterface`)
      }
    })
    describe('COMPARE', () => {
      it(`.getInterview: Should have the same interview instance`, () => {
        return Promise.all(services.map(s => s.getInterview(interviewId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getActions: Should get the same array of actions', () => {
        return Promise.all(services.map(s => s.getActions(interviewId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getData: should get the same InterviewDataInterface', () => {
        return Promise.all(services.map(s => s.getData(interviewId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getPreload: should get the same preload data')
    })
  })
}
