import http from '../http/AxiosInstance'
import RosterServiceInterface from './RosterServiceInterface'
import Roster from '../../entities/trellis/Roster'

export class RosterServiceWeb implements RosterServiceInterface {
  async getRosterRows (rosterIds: string[]): Promise<Roster[]> {
    const res = await http().get(`rosters/${rosterIds.join(',')}`)
    return res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
  }

  async createRosterRows (rosterRows: string[]): Promise<Roster[]> {
    const res = await http().post('rosters', {
      rosters: rosterRows,
    })
    return res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
  }

  async editRosterRow (changedRow: Roster): Promise<any> {
    const res = await http().put('rosters', {
      rosters: [changedRow],
    })
    return res.data
  }
}
