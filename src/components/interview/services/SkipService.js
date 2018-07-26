export default class SkipService {
  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param {Array} skipCondition - Skip conditions as defined by the form blueprint
   * @param {Set} conditions - A Set of existing condition ids
   * @returns {boolean}
   */
  static shouldSkipPage (skipConditions, conditionTags) {
    let shouldSkip = false
    let conditionKey = 'condition_tag_name'
    for (let skipCondition of skipConditions) {
      // Cast condition booleans as boolean
      for (let boolKey of ['show_hide', 'any_all']) {
        if (skipCondition[boolKey] === '0' || skipCondition[boolKey] === 0 || skipCondition[boolKey] === 'false') {
          skipCondition[boolKey] = false
        } else if (skipCondition[boolKey] === '1' || skipCondition[boolKey] === 1 || skipCondition[boolKey] === 'true') {
          skipCondition[boolKey] = true
        }
      }
      if (skipCondition.show_hide) {
        if (!skipCondition.any_all) {
          // Show if any are true
          shouldSkip = true
          for (let condition of skipCondition.conditions) {
            if (conditionTags.has(condition[conditionKey])) {
              shouldSkip = false
              break
            }
          }
        } else {
          // Show if all are true
          shouldSkip = skipCondition.conditions.length === 0
          for (let condition of skipCondition.conditions) {
            if (!conditionTags.has(condition[conditionKey])) {
              shouldSkip = true
            }
          }
        }
        if (!shouldSkip) {
          return shouldSkip
        }
      } else {
        if (!skipCondition.any_all) {
          // Hide if any are true
          shouldSkip = false
          for (let condition of skipCondition.conditions) {
            if (conditionTags.has(condition[conditionKey])) {
              shouldSkip = true
              break
            }
          }
        } else {
          // Hide if all are true
          shouldSkip = skipCondition.conditions.length !== 0
          for (let condition of skipCondition.conditions) {
            if (!conditionTags.has(condition[conditionKey])) {
              shouldSkip = false
              break
            }
          }
        }
        if (shouldSkip) {
          return shouldSkip
        }
      }
    }
    return shouldSkip
  }
}
