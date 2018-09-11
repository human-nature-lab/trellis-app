import GeoServiceCordova from '../../src/services/geo/GeoServiceCordova'
import GeoServiceWeb from '../../src/services/geo/GeoServiceWeb'

import {expect} from 'chai'
import {geoId} from "./testing-ids";
import {deepCompareEntities} from "./helpers";
import Geo from "../../src/entities/trellis/Geo";

export default function () {
  describe('GeoService', function (this: any) {
    this.timeout(60 * 1000)
    let services = [new GeoServiceWeb(), new GeoServiceCordova()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getGeoById should return a Geo`, async () => {
          let geo = await service.getGeoById(geoId)
          expect(geo).to.be.an.instanceOf(Geo)
        })
        it(`${service.constructor.name}.getGeosById should return an array of Geos`, async () => {
          let geos = await service.getGeosById([geoId])
          expect(geos).to.be.an('array')
          for (let geo of geos) {
            expect(geo).to.be.an.instanceOf(Geo)
          }
        })
        it(`${service.constructor.name}.getGeoAncestors should return an array of a geos parents`, async () => {
          let ancestors = await service.getGeoAncestors(geoId)
          expect(ancestors).to.be.an('array')
          for (let geo of ancestors) {
            expect(geo).to.be.an.instanceOf(Geo)
          }
          // expect(ancestors.map(a => a.id)).to.not.include(geoId, 'Ancestors include the provided geo')
        })
        it(`${service.constructor.name}.search should return an array of a geos based on the search`, () => {
          // TODO
          expect(false).to.equal(true)
        })
      }
    })
    describe('COMPARE', () => {
      it('.getGeoById', () => {
        return Promise.all(services.map(s => s.getGeoById(geoId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getGeosById', () => {
        return Promise.all(services.map(s => s.getGeosById([geoId]))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getGeoAncestors', () => {
        return Promise.all(services.map(s => s.getGeoAncestors(geoId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.search', () => {
        // TODO
        expect(true).to.equal(false, 'Compare the search results without order')
      })
    })
  })
}
