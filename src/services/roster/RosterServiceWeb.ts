import http from '../http/AxiosInstance'
import RosterServiceInterface from "./RosterServiceInterface";
import Roster from "../../entities/trellis/Roster";


export default class RosterServiceWeb implements RosterServiceInterface {
  async getRosterRows (rosterIds): Promise<Roster[]> {
    let res = await http().get(`rosters/${rosterIds.join(',')}`)
    return res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
  }
  async createRosterRows (rosterRows): Promise<Roster[]> {
    let res = await http().post(`rosters`, {
      rosters: rosterRows
    })
    return res.data.rosters.map(r => new Roster().fromSnakeJSON(r))
  }

  async editRosterRow (changedRow): Promise<any> {
    let res = await http().put('rosters', {
      rosters: [changedRow]
    })
    return res.data
  }
}
