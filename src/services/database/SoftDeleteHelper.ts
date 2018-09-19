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
      // if (obj[i] && obj[i].constructor && obj[i].constructor.name === 'Question') {
      //   if (obj[i].questionParameters.length === 2) {
      //     debugger
      //   }
      // }
      if (obj[i][softDeleteKey] != null) {
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
