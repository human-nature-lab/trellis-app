import './globals'
import EdgeServiceWeb from '../../src/services/edge/EdgeServiceWeb'
import EdgeServiceCordova from '../../src/services/edge/EdgeServiceCordova'

import {expect} from 'chai'
import {edgeIds, respondentId, respondentId2, respondentId3} from "../testing-ids";
import Respondent from "../../src/entities/trellis/Respondent";
import Edge from "../../src/entities/trellis/Edge";
import {deepCompareEntities} from "./helpers";

export default function () {
  describe('EdgeService', function (this: any) {
    this.timeout(60 * 1000)
    const services = [new EdgeServiceCordova(), new EdgeServiceWeb()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getEdges: should return a list of edges`, async () => {
          let edges = await service.getEdges(edgeIds)
          expect(edges).to.be.an('array')
          expect(edges.length).to.equal(edgeIds.length, 'Incorrect number of edges returned')
          for (let edge of edges) {
            expect(edge).to.be.an.instanceOf(Edge)
            expect(edge.targetRespondent).to.be.an.instanceOf(Respondent)
            expect(edge.sourceRespondent).to.be.an.instanceOf(Respondent)
          }
        })
        it(`${service.constructor.name}.createEdges: should create an array of edges`, async () => {
          let edgesToMake = [{
            source_respondent_id: respondentId,
            target_respondent_id: respondentId2
          }, {
            source_respondent_id: respondentId3,
            target_respondent_id: respondentId2
          }]
          let edges = await service.createEdges(edgesToMake)
          expect(edges.length).to.equal(2, 'Incorrect number of edges returned')
          for (let i = 0; i < edgesToMake.length; i++) {
            expect(edges[i].sourceRespondentId).to.equal(edgesToMake[i].source_respondent_id, 'Source ids do not match')
            expect(edges[i].targetRespondentId).to.equal(edgesToMake[i].target_respondent_id, 'Target ids do not match')
          }
          let dbEdges = await service.getEdges(edges.map(e => e.id))
          for (let edge of edgesToMake) {
            expect(dbEdges).to.satisfy(function (edges) {
              return edges.find(e => {
                return e.targetRespondentId === edge.target_respondent_id &&
                  e.sourceRespondentId === edge.source_respondent_id
              })
            }, 'Database does not include edge')
          }
        })
      }
    })
    describe('COMPARE', () => {
      it('.getEdges: should return the same edges', () => {
        return Promise.all(services.map(s => s.getEdges(edgeIds))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
    })
  })
}
