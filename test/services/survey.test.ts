import { SurveyServiceWeb } from '../../src/services/survey/SurveyService.web'
import { SurveyServiceCordova } from '../../src/services/survey/SurveyService.mobile'
import Survey from "../../src/entities/trellis/Survey";
import './globals'

import {expect} from 'chai'
import {deepCompareEntities} from "./helpers";
import {formId, respondentId, studyId} from "../testing-ids";

function className (o) {
  if (o.constructor && o.constructor.name) {
    return o.constructor.name
  }
  return 'unknown'
}



export default function () {
  describe('SurveyService', function (this: any) {
    // this.timeout(10 * 1000)
    let services = [new SurveyServiceCordova(), new SurveyServiceWeb()]
    describe('API', () => {
      for (let i = 0; i < services.length; i++) {
        let service = services[i]
        it(className(service) + '.getSurvey: should return a survey', () => {
          return service.getSurvey(studyId, respondentId, formId).then(survey => {
            expect(survey).to.be.an.instanceOf(Survey)
            return true
          })
        })
        it(className(service) + '.getRespondentSurveys: should return an array of surveys that have been created', () => {
          return service.getRespondentSurveys(studyId, respondentId).then(surveys => {
            expect(surveys).to.be.an('array').and.to.not.be.empty
            for (let survey of surveys) {
              expect(survey).to.be.an.instanceOf(Survey)
            }
            return true
          })
        })
        it(className(service) + '.create: should create a new survey')
        it(className(service) + '.complete: should mark a survey as complete')
      }
    })
    describe('COMPARE', () => {
      it('.getSurvey: should return the same survey', () => {
        return Promise.all(services.map(s => s.getSurvey(studyId, respondentId, formId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getRespondentSurveys: should return the same respondent surveys', () => {
        return Promise.all(services.map(s => s.getRespondentSurveys(studyId, respondentId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
    })
  })
}
