import { isEqualWith } from 'lodash'

export default class CompareService {
  static entitiesAreEqual (a, b) {
    function entityCompare (objVal, othVal) {
      if (typeof objVal === 'function') {
        return true
      } else {
        return
      }
    }
    return isEqualWith(a, b, entityCompare)
  }
}
