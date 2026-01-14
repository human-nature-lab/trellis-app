import './globals'
import { expect } from 'chai'
import { SearchFilter } from '../../src/services/respondent/RespondentServiceInterface'
import { RandomPagination } from '../../src/types/Pagination'
import { RespondentService as RespondentServiceCordova } from '../../src/services/respondent/RespondentService.mobile'
import { RespondentService as RespondentServiceWeb } from '../../src/services/respondent/RespondentService.web'
import { studyId, geoId, respondentId } from '../testing-ids'
import { deepCompareEntities } from './helpers'
import RespondentFill from '../../src/entities/trellis/RespondentFill'
import Respondent from '../../src/entities/trellis/Respondent'
import RespondentGeo from '../../src/entities/trellis/RespondentGeo'
import Geo from '../../src/entities/trellis/Geo'
import Translation from '../../src/entities/trellis/Translation'
import GeoType from '../../src/entities/trellis/GeoType'

export default function () {
  describe('RespondentService', function (this: any) {
    this.timeout(60 * 1000)
    const services = {
      web: new RespondentServiceWeb(),
      mobile: new RespondentServiceCordova(),
    }
    describe('API', () => {
      for (const [serviceName, service] of Object.entries(services)) {
        it(`${serviceName}.getRespondentFillsById should return all respondent fills`, async () => {
          const fills = await service.getRespondentFillsById(respondentId)
          expect(fills).to.be.an('array')
          for (const fill of fills) {
            expect(fill).to.be.an.instanceOf(RespondentFill)
            for (const prop of ['id', 'respondentId', 'name', 'val']) {
              expect(fill).to.have.property(prop)
            }
          }
        })
        it(`${serviceName}.getRespondentById should return a respondent instance`, async () => {
          const respondent = await service.getRespondentById(respondentId)
          expect(respondent).to.be.an.instanceOf(Respondent)
        })
        it(`${serviceName}.addName should create a new respondent name`)
        it(`${serviceName}.editName should edit a respondent name`)
        it(`${serviceName}.removeName should delete a respondent name`)
        it(`${serviceName}.createRespondent should create a new respondent`)
        it(`${serviceName}.addRespondentGeo should create a new respondent geo`, async () => {
          const respondentGeo = await service.addRespondentGeo(respondentId, geoId, true)
          expect(respondentGeo).to.be.an.instanceOf(RespondentGeo)
          expect(respondentGeo.geo).to.be.an.instanceof(Geo)
          expect(respondentGeo.geo.nameTranslation).to.be.an.instanceOf(Translation)
          expect(respondentGeo.geo.photos).to.be.an('array')
          expect(respondentGeo.geo.geoType).to.be.an.instanceOf(GeoType)
          const respondent = await service.getRespondentById(respondentId)
          expect(respondent.geos).to.be.an('array')
          expect(respondent.geos).to.satisfy(function (geos) {
            return geos.find(rGeo => rGeo.id === respondentGeo.id)
          }, 'Couldn\'t find the added respondent geo on this respondent')
        })
        it(`${serviceName}.moveRespondentGeo should create a new respondent geo and create a link to the old respondent geo`)
        it(`${serviceName}.removeRespondentGeo should delete a respondent geo`)
      }
    })
    describe('COMPARE', () => {
      it('.getRespondentFillsById', () => {
        return Promise.all(Object.values(services).map(s => s.getRespondentFillsById(respondentId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getRespondentById', () => {
        return Promise.all(Object.values(services).map(s => s.getRespondentById(respondentId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
    })
    describe('SEARCH', () => {
      const pagination: RandomPagination = {
        seed: 1234567890,
        page: 0,
        size: 10,
        total: 10,
      }
      for (const [serviceName, service] of Object.entries(services)) {
        it(`${serviceName} should return a deterministic result when randomization is false`, async () => {
          const result = await service.getSearchPage(studyId, '', { randomize: false }, pagination)
          expect(result.data).to.be.an('array')
          expect(result.data.length).to.be.equal(10)
        })
        it(`${serviceName} should work with conditionTags filter`, async () => {
          const result = await service.getSearchPage(studyId, '', { conditionTags: ['male'] }, pagination)
          expect(result.data).to.be.an('array')
          expect(result.data.length).to.be.equal(10)
        })
        it(`${serviceName} should work with orConditions filter`, async () => {
          const result = await service.getSearchPage(studyId, '', { orConditionTags: ['male', 'female'] }, pagination)
          expect(result.data).to.be.an('array')
          expect(result.data.length).to.be.equal(10)
        })
      }
    })
  })
}
