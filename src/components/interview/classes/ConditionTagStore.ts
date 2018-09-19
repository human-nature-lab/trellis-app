import ConditionTag from "../../../entities/trellis/ConditionTag";

export class ConditionTagStore {
  private data: ConditionTag[]
  private idToNameMap: Map<string, string>

  constructor () {
    this.data = []
    this.idToNameMap = new Map()
  }

  /**
   * Add a single tag
   * @param {ConditionTag} tag
   */
  add (tag: ConditionTag) {
    this.idToNameMap.set(tag.id, tag.name)
    this.data.push(tag)
  }

  /**
   * Return the name of the condition tag based on the name
   * @param id
   * @returns {any}
   */
  getNameFromId (id) {
    return this.idToNameMap.get(id)
  }

  /**
   * Remove all data from the store
   */
  clear () {
    this.data = []
    this.idToNameMap.clear()
  }
}

let c = new ConditionTagStore()

export default c
