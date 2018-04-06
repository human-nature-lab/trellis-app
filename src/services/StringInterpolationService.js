const matchAllBrackets = /\[([^\[\]]+)\]/g    // eslint-disable-line no-useless-escape
export default class StringInterpolationService {
  /**
   * TODO: Think this one through a bit. It would be nice to be able to replace with any previous question response, but
   * I'll need to think about it for a little while
   * @param msg
   * @param {object} vals - Key pairs of question names and their values
   */
  static interpolate (msg, vals) {
    let matches = matchAllBrackets.exec(msg)
    if (matches) {
      for (let match of matches) {
        msg = msg.replace(`[${match}]`, vals[match] ? vals[match] : 'UNDEFINED_VAR_NAME')
      }
    }
    return msg
  }
}
