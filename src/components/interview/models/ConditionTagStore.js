export class ConditionTagStore {
  constructor () {
    this.data = []
    this.idToNameMap = new Map()
  }

  /**
   * Add a single tag
   * @param {Object} tag - Object repesentation of tag
   */
  add (tag) {
    console.log('tag', JSON.stringify(tag, null, 2))
    this.idToNameMap.set(tag.id, tag.name)
    this.data.push(tag)
  }

  /**
   * Return the name of the condition tag based on the name
   * @param {String} id
   * @returns {String | undefined}
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
window.ConditionTagStore = c
export default c
