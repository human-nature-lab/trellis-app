import http from '../http/AxiosInstance'
import RosterServiceInterface from './RosterServiceInterface'
import Roster from '../../entities/trellis/Roster'

export class RosterServiceWeb implements RosterServiceInterface {
  cache: Map<string, Roster> = new Map()

  async getRosterRow (rosterId: string): Promise<Roster> {
    if (this.cache.has(rosterId)) {
      return this.cache.get(rosterId)
    }
    const res = await http().get(`rosters/${rosterId}`)
    const roster = new Roster().fromSnakeJSON(res.data)
    this.cache.set(rosterId, roster)
    return roster
  }
  async getRosterRows (rosterIds: string[]): Promise<Roster[]> {
    const res = await http().get(`rosters/${rosterIds.join(',')}`)
    const rosters = res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
    for (const roster of rosters) {
      this.cache.set(roster.id, roster)
    }
    return rosters
  }

  async createRosterRows (rosterRows: string[]): Promise<Roster[]> {
    const res = await http().post('rosters', {
      rosters: rosterRows,
    })
    const rosters = res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
    for (const roster of rosters) {
      this.cache.set(roster.id, roster)
    }
    return rosters
  }

  async editRosterRow (changedRow: Roster): Promise<any> {
    const res = await http().put('rosters', {
      rosters: [changedRow],
    })
    this.cache.set(changedRow.id, changedRow)
    return res.data
  }
}
