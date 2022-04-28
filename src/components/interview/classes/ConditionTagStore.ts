import ConditionTag from '../../../entities/trellis/ConditionTag'

export class ConditionTagStore {
  private idToNameMap: Map<string, string>
  private idToTag: Map<string, ConditionTag>
  private nameToId = new Map<string, string>()

  constructor () {
    this.idToNameMap = new Map()
    this.idToTag = new Map()
  }

  /**
   * Add a single tag
   * @param {ConditionTag} tag
   */
  add (tag: ConditionTag) {
    this.idToNameMap.set(tag.id, tag.name)
    this.idToTag.set(tag.id, tag)
    this.nameToId.set(tag.name, tag.id)
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
   * Return the condition tag
   * @param id
   */
  getTagById (id) {
    return this.idToTag.get(id)
  }

  
  getIdFromName (name: string) {
    return this.nameToId.get(name)
  }

  /**
   * Remove all data from the store
   */
  clear () {
    this.idToNameMap.clear()
    this.idToTag.clear()
    this.nameToId.clear()
  }
}

export default new ConditionTagStore()
