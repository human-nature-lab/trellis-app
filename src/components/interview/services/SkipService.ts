import Skip from '../../../entities/trellis/Skip'

export default class SkipService {
  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param {Skip[]} skips - Skips as defined by the form blueprint
   * @param {Set<string>} conditionTags - A Set of existing condition names
   * @returns {boolean}
   */
  static shouldSkipPage (skips: Skip[], conditionTags: Set<string>): boolean {
    let shouldShow = false
    for (let skip of skips) {
      if (skip.showHide) {
        // Show
        if (!skip.anyAll) {
          // Show if any are true
          shouldShow = false
          for (let condition of skip.conditionTags) {
            if (conditionTags.has(condition.conditionTagName)) {
              shouldShow = true
              break
            }
          }
        } else {
          // Show if all are true
          shouldShow = true
          for (let condition of skip.conditionTags) {
            if (!conditionTags.has(condition.conditionTagName)) {
              shouldShow = false
              break
            }
          }
        }
      } else {
        // Hide
        if (!skip.anyAll) {
          // Hide if any are true
          shouldShow = true
          for (let condition of skip.conditionTags) {
            if (conditionTags.has(condition.conditionTagName)) {
              shouldShow = false
              break
            }
          }
        } else {
          // Hide if all are true
          if (conditionTags.size === 0) {
            shouldShow = true
            break
          }
          shouldShow = false
          for (let condition of skip.conditionTags) {
            if (!conditionTags.has(condition.conditionTagName)) {
              shouldShow = true
              break
            }
          }
        }
      }
    }
    return !shouldShow
  }
}
