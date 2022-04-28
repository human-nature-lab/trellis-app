import RosterServiceInterface from './RosterServiceInterface'
import Roster from '../../entities/trellis/Roster'
import DatabaseService from '../../services/database'

export class RosterServiceCordova implements RosterServiceInterface {
  async getRosterRows (rosterIds: string[]): Promise<Roster[]> {
    const repo = await DatabaseService.getRepository(Roster)
    return repo.findByIds(rosterIds)
  }
  async createRosterRows (rosterRows: string[]): Promise<Roster[]> {
    const conn = await DatabaseService.getDatabase()
    const repo = await DatabaseService.getRepository(Roster)
    let rosters = rosterRows.map(val => {
      let roster = new Roster()
      roster.val = val
      return roster
    })

    // await conn.transaction(async manager => {
    //   console.log('roster transaction open')
    //   await manager.insert(Roster, rosters)
    //   console.log('roster transaction closing')
    // })

    let res = await repo.save(rosters)
    return rosters
  }
  async editRosterRow (roster: Roster): Promise<void> {
    const repo = await DatabaseService.getRepository(Roster)
    await repo.save(roster)
  }
}
