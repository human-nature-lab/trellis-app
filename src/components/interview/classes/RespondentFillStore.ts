import RespondentFill from "../../../entities/trellis/RespondentFill";

export default class RespondentFillStore {
  private map: Map<string, string> = new Map()

  /**
   * Fill the store with an array of fills
   * @param {RespondentFill[]} fills
   */
  fill (fills: RespondentFill[]) {
    for (let fill of fills) {
      this.add(fill)
    }
  }

  /**
   * Add a respondent fill to the store. This indexes it by name
   * @param {RespondentFill} fill - The fill with name and val properties
   */
  add (fill: RespondentFill) {
    this.map.set(fill.name, fill.val)
  }

  /**
   * Get a respondent fill by the name
   * @param {string} name
   * @returns {any}
   */
  get (name: string) {
    return this.map.get(name)
  }
}
