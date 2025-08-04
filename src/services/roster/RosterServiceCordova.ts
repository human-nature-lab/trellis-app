import RosterServiceInterface from './RosterServiceInterface'
import Roster from '../../entities/trellis/Roster'
import DatabaseService from '../../services/database'

export class RosterServiceCordova implements RosterServiceInterface {
  cache: Map<string, Roster> = new Map()

  async getRosterRows (rosterIds: string[]): Promise<Roster[]> {
    const repo = await DatabaseService.getRepository(Roster)
    const rosters = await repo.findByIds(rosterIds)
    for (const roster of rosters) {
      this.cache.set(roster.id, roster)
    }
    return rosters
  }

  async createRosterRows (rosterRows: string[]): Promise<Roster[]> {
    const repo = await DatabaseService.getRepository(Roster)
    let rosters = rosterRows.map(val => {
      const roster = new Roster()
      roster.val = val
      return roster
    })

    // await conn.transaction(async manager => {
    //   console.log('roster transaction open')
    //   await manager.insert(Roster, rosters)
    //   console.log('roster transaction closing')
    // })

    rosters = await repo.save(rosters)
    for (const roster of rosters) {
      this.cache.set(roster.id, roster)
    }
    return rosters
  }
  
  async editRosterRow (roster: Roster): Promise<void> {
    const repo = await DatabaseService.getRepository(Roster)
    await repo.save(roster)
    this.cache.set(roster.id, roster)
  }
}
