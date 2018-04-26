import http from '@/services/http/AxiosInstance'
export default class RosterServiceWeb {
  /**
   * Get an array of roster rows by passing in an array of rosterIds
   * @param {Array} rosterIds - An array of roster ids
   * @returns {Promise<Array>} - Resolves to an array of roster rows
   */
  static getRosterRows (rosterIds) {
    return http().get(`rosters/${rosterIds.join(',')}`)
      .then(res => {
        return res.data.rosters
      })
  }

  /**
   * Create an array of roster rows from an array of roster row values
   * @param {Array} rosterRows - The new roster row values to create
   * @returns {Promise<Array>} - Resolves to an array of ids and values for the roster rows
   */
  static createRosterRows (rosterRows) {
    return http().post(`rosters`, {
      rosters: rosterRows
    }).then(res => {
      return res.data.rosters
    })
  }

  /**
   * Edit a single roster row
   * @param {Object} changedRow - The roster id and new value
   * @returns {Promise<Object>} - resolves to an ok message on success
   */
  static editRosterRow (changedRow) {
    return http().put('rosters', {
      rosters: [changedRow]
    }).then(res => {
      return res.data
    })
  }
}
