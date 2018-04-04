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
    for (let skipCondition of skipConditions) {
      // Cast condition booleans as boolean
      for (let boolKey of ['show_hide', 'any_all']) {
        if (skipCondition[boolKey] === '0' || skipCondition[boolKey] === 0) {
          skipCondition[boolKey] = false
        } else if (skipCondition[boolKey] === '1' || skipCondition[boolKey] === 1) {
          skipCondition[boolKey] = true
        }
      }
      if (skipCondition.show_hide) {
        if (skipCondition.any_all) {
          // Show if any are true
          shouldSkip = true
          for (let condition of skipCondition.conditions) {
            if (conditionTags.has(condition.id)) {
              shouldSkip = false
              break
            }
          }
        } else {
          // Show if all are true
          shouldSkip = false
          for (let condition of skipCondition.conditions) {
            if (!conditionTags.has(condition.id)) {
              shouldSkip = true
              break
            }
          }
        }
      } else {
        if (skipCondition.any_all) {
          // Hide if any are true
          shouldSkip = false
          for (let condition of skipCondition.conditions) {
            if (conditionTags.has(condition.id)) {
              shouldSkip = true
              break
            }
          }
        } else {
          // Hide if all are true
          shouldSkip = true
          for (let condition of skipCondition.conditions) {
            if (!conditionTags.has(condition.id)) {
              shouldSkip = false
              break
            }
          }
        }
      }
    }
    return shouldSkip
  }
}