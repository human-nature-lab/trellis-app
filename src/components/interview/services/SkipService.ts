import Skip from '../../../entities/trellis/Skip'

export default class SkipService {
  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param {Skip[]} skips - Skips as defined by the form blueprint
   * @param {Set<string>} conditionTags - A Set of existing condition names
   * @returns {boolean}
   */
  static shouldSkipPage (skips: Skip[], conditionTags: Set<string>) {
    let shouldSkip = false
    for (let skip of skips) {
      if (skip.showHide) {
        if (!skip.anyAll) {
          // Show if any are true
          shouldSkip = true
          for (let condition of skip.conditionTags) {
            if (conditionTags.has(condition.conditionTagName)) {
              shouldSkip = false
              break
            }
          }
        } else {
          // Show if all are true
          shouldSkip = skip.conditionTags.length === 0
          for (let condition of skip.conditionTags) {
            if (!conditionTags.has(condition.conditionTagName)) {
              shouldSkip = true
            }
          }
        }
        if (!shouldSkip) {
          return shouldSkip
        }
      } else {
        if (!skip.anyAll) {
          // Hide if any are true
          shouldSkip = false
          for (let condition of skip.conditionTags) {
            if (conditionTags.has(condition.conditionTagName)) {
              shouldSkip = true
              break
            }
          }
        } else {
          // Hide if all are true
          shouldSkip = skip.conditionTags.length !== 0
          for (let condition of skip.conditionTags) {
            if (!conditionTags.has(condition.conditionTagName)) {
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
