const matchAllBrackets = /\[([^\[\]]+)\]/g    // eslint-disable-line no-useless-escape
export default class StringInterpolationService {

  /**
   * Returns an array of all of the interpolated keys. These can be used to lookup the corresponding data.
   * @param {String} msg - The message to extract the keys from
   * @returns {Array} - 0 or more interpolation keys
   */
  static getInterpolationKeys (msg: string) {
    let match
    let keys = []
    while ((match = matchAllBrackets.exec(msg)) !== null) {
      // This is necessary to avoid infinite loops with zero-width match
      if (match.index === matchAllBrackets.lastIndex) {
        matchAllBrackets.lastIndex++
      }
      keys.push(match[1])
    }
    return keys
  }

  /**
   * TODO: Think this one through a bit. It would be nice to be able to replace with any previous question response, but
   * I'll need to think about it for a little while
   * @param msg
   * @param {object} vals - Key pairs of question names and their values
   */
  static interpolate (msg: string, vals: {[key: string]: any}) {
    let match
    let interpolatedMsg = msg
    while ((match = matchAllBrackets.exec(msg)) !== null) {
      // This is necessary to avoid infinite loops with zero-width match
      if (match.index === matchAllBrackets.lastIndex) {
        matchAllBrackets.lastIndex++
      }
      interpolatedMsg = interpolatedMsg.replace(`[${match[1]}]`, vals[match[1]] ? vals[match[1]] : 'UNDEFINED_VAR_NAME')
    }
    return interpolatedMsg
  }
}
