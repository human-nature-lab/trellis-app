import './globals'
import {expect} from 'chai'
import StudyServiceWeb from '../../src/services/study/StudyServiceWeb'
import StudyServiceCordova from '../../src/services/study/StudyServiceCordova'
import {studyId, userId} from "./testing-ids";
import {deepCompareEntities} from "./helpers";

export default function () {
  describe('StudyService', function (this: any) {
    this.timeout(60 * 1000)
    const services = [new StudyServiceCordova(), new StudyServiceWeb()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getStudy should return a study`)
        it(`${service.constructor.name}.getMyStudies should return an array of studies assigned to me`)
        it(`${service.constructor.name}.getUserStudies should return an array of studies assigned to this user`)
      }
    })
    describe('COMPARE', () => {
      it('.getStudy', () => {
        return Promise.all(services.map(s => s.getStudy(studyId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getMyStudies', () => {
        return Promise.all(services.map(s => s.getMyStudies())).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
      it('.getUserStudies', () => {
        return Promise.all(services.map(s => s.getUserStudies(userId))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
    })
  })
}
