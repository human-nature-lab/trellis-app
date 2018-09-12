import RosterServiceInterface from "./RosterServiceInterface";
import Roster from "../../entities/trellis/Roster";
import DatabaseService from '../../services/database/DatabaseService'



export default class RosterServiceCordova implements RosterServiceInterface {
  async getRosterRows (rosterIds: string[]): Promise<Roster[]> {
    const repo = await DatabaseService.getRepository(Roster)
    return await repo.findByIds(rosterIds)
  }
  async createRosterRows (rosterRows: string[]): Promise<Roster[]> {
    const repo = await DatabaseService.getRepository(Roster)
    let rosters = rosterRows.map(val => {
      let roster = new Roster()
      roster.val = val
      return roster
    })
    let res = await repo.save(rosters)
    return rosters
  }
  async editRosterRow (roster: Roster): Promise<void> {
    const repo = await DatabaseService.getRepository(Roster)
    await repo.save(roster)
  }
}
