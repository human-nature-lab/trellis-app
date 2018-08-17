import Roster from "../../entities/trellis/Roster";

export default interface RosterServiceInterface {

  /**
   * Get multiple rosters by their ids
   * @param {string[]} rosterIds
   * @returns {Promise<Roster[]>}
   */
  getRosterRows (rosterIds: string[]): Promise<Roster[]>

  /**
   * Create a number of roster rows
   * @param {string[]} rosterVals
   * @returns {Promise<Roster[]>}
   */
  createRosterRows (rosterVals: string[]): Promise<Roster[]>

  /**
   * Edit a single roster row
   * @param {Roster} roster
   * @returns {Promise<void>}
   */
  editRosterRow (roster: Roster): Promise<void>
}
