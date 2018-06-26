export default class RespondentFillStore {
  constructor () {
    this.map = new Map()
  }

  /**
   * Fill the store with an array of fills
   * @param {Array} fills
   */
  fill (fills) {
    for (let fill of fills) {
      this.add(fill)
    }
  }

  /**
   * Add a respondent fill to the store. This indexes it by name
   * @param {Object} fill - The fill with name and val properties
   */
  add (fill) {
    this.map.set(fill.name, fill.val)
  }

  /**
   * Get a respondent fill by the name
   * @param {String} name
   * @returns {V | undefined}
   */
  get (name) {
    return this.map.get(name)
  }
}
