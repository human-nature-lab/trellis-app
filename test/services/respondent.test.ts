import './globals'
import {expect} from 'chai'
import RespondentServiceCordova from "../../src/services/respondent/RespondentServiceCordova";
import RespondentServiceWeb from "../../src/services/respondent/RespondentServiceWeb";
import {respondentId} from "./testing-ids";
import {deepCompareEntities} from "./helpers";
import RespondentFill from "../../src/entities/trellis/RespondentFill";
import Respondent from "../../src/entities/trellis/Respondent";

export default function () {
  describe('RespondentService', () => {
    let services = [new RespondentServiceCordova(), new RespondentServiceWeb()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getRespondentFillsById should return all respondent fills`, async () => {
          let fills = await service.getRespondentFillsById(respondentId)
          expect(fills).to.be.an('array')
          for (let fill of fills) {
            expect(fill).to.be.an.instanceOf(RespondentFill)
            for (let prop of ['id', 'respondentId', 'name', 'val']) {
              expect(fill).to.have.property(prop)
            }
          }
        })
        it(`${service.constructor.name}.getRespondentById should return a respondent instance`, async () => {
          let respondent = await service.getRespondentById(respondentId)
          expect(respondent).to.be.an.instanceOf(Respondent)
        })
        it(`${service.constructor.name}.getSearchPage should return an array of respondents`, async () => {
          // TODO: test the various filters here
          expect(false).to.equal(true, 'Test get search page')
        })
        it(`${service.constructor.name}.addName should create a new respondent name`)
        it(`${service.constructor.name}.editName should edit a respondent name`)
        it(`${service.constructor.name}.removeName should delete a respondent name`)
        it(`${service.constructor.name}.createRespondent should create a new respondent`)
        it(`${service.constructor.name}.addRespondentGeo should create a new respondent geo`)
        it(`${service.constructor.name}.moveRespondentGeo should create a new respondent geo and create a link to the old respondent geo`)
        it(`${service.constructor.name}.removeRespondentGeo should delete a respondent geo`)
      }
    })
    describe('COMPARE', () => {
      it('.getRespondentFillsById', () => {
        return Promise.all(services.map(s => s.getRespondentFillsById(respondentId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getRespondentById', () => {
        return Promise.all(services.map(s => s.getRespondentById(respondentId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getSearchPage', () => {
        // TODO
        expect(false).to.equal(true, 'Compare search results here')
      })
    })
  })
}
