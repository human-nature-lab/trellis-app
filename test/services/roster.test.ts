import './globals'
import {expect} from 'chai'
import RosterServiceWeb from "../../src/services/roster/RosterServiceWeb";
import RosterServiceCordova from "../../src/services/roster/RosterServiceCordova";
import {editRosterId, rosterId} from "../testing-ids";
import Roster from "../../src/entities/trellis/Roster";
import {deepCompareEntities} from "./helpers";


export default function () {
  describe('RosterService', function (this: any) {
    this.timeout(60 * 1000)
    let services = [new RosterServiceWeb(), new RosterServiceCordova()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getRosterRows should return an array of Rosters`, async () => {
          let rosters = await service.getRosterRows([rosterId])
          expect(rosters.length).to.equal(1, 'Too many rosters returned')
          for (let roster of rosters) {
            expect(roster).to.be.an.instanceOf(Roster)
          }
        })
        it(`${service.constructor.name}.createRosterRows should create rosters and return an array of Rosters`, async () => {
          const testVals = ['first', 'second', 'third']
          let rosters = await service.createRosterRows(testVals)
          expect(rosters.length).to.equal(testVals.length, 'Expected the same number of rosters as values submitted')
          for (let roster of rosters) {
            expect(roster).to.be.an.instanceOf(Roster)
            let dRoster = (await service.getRosterRows([roster.id]))[0]
            deepCompareEntities(roster, dRoster)
          }
        })
        it(`${service.constructor.name}.editRosterRow should store the edits to a Roster`, async () => {
          const res = await service.getRosterRows([editRosterId])
          const editRoster = res[0]
          const initVal = editRoster.val
          const newVal = 'edited'
          expect(initVal).to.not.equal(newVal, 'Please reset the database because the values are already edited')
          editRoster.val = newVal
          await service.editRosterRow(editRoster)
          const dbRoster = (await service.getRosterRows([editRosterId]))[0]
          expect(dbRoster.val).to.equal(newVal, 'The roster in the database does not match the edit')
          editRoster.val = initVal
          await service.editRosterRow(editRoster)
        })
      }
    })
    describe('COMPARE', () => {
      it(`.getRosterRows`, () => {
        return Promise.all(services.map(s => s.getRosterRows([rosterId]))).then(res => {
          deepCompareEntities(res[0], res[1])
        })
      })
    })
  })
}
