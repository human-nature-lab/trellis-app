import Skip from '../../../entities/trellis/Skip'

export default class SkipService {
  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param {Array} skipCondition - Skip conditions as defined by the form blueprint
   * @param {Set} conditions - A Set of existing condition ids
   * @returns {boolean}
   */
  static shouldSkipPage (skipConditions: Skip[], conditionTags: Set<string>) {
    let shouldSkip = false
    let conditionKey = 'condition_tag_name'
    for (let skipCondition of skipConditions) {
      if (skipCondition.showHide) {
        if (!skipCondition.anyAll) {
          // Show if any are true
          shouldSkip = true
          for (let condition of skipCondition.conditionTags) {
            if (conditionTags.has(condition[conditionKey])) {
              shouldSkip = false
              break
            }
          }
        } else {
          // Show if all are true
          shouldSkip = skipCondition.conditionTags.length === 0
          for (let condition of skipCondition.conditionTags) {
            if (!conditionTags.has(condition[conditionKey])) {
              shouldSkip = true
            }
          }
        }
        if (!shouldSkip) {
          return shouldSkip
        }
      } else {
        if (!skipCondition.anyAll) {
          // Hide if any are true
          shouldSkip = false
          for (let condition of skipCondition.conditionTags) {
            if (conditionTags.has(condition[conditionKey])) {
              shouldSkip = true
              break
            }
          }
        } else {
          // Hide if all are true
          shouldSkip = skipCondition.conditionTags.length !== 0
          for (let condition of skipCondition.conditionTags) {
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
