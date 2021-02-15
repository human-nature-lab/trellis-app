/**
 * Mutates an object or array to remove all soft deleted entities recursively
 * @param obj
 * @param {string} softDeleteKey
 * @mutating
 * @returns {any}
 */
export function removeSoftDeleted (obj: any, softDeleteKey: string = 'deletedAt') {
  if (obj === null) return
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const deletedVal = obj[i][softDeleteKey]
      if (deletedVal !== null && deletedVal !== undefined) {
        obj.splice(i, 1)
        i--
      } else {
        removeSoftDeleted(obj[i], softDeleteKey)
      }
    }
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      removeSoftDeleted(obj[key], softDeleteKey)
    }
  }
}
