import { InterviewLocation } from '../components/interview/services/InterviewAlligator'
import InterviewManager from '../components/interview/classes/InterviewManager'
import { createSkipApi } from '../components/interview/classes/SkipApi'
import Skip from '../entities/trellis/Skip'
import SaferEvalService from './SaferEvalService'
export default class SkipService {
  evalService = new SaferEvalService()

  register (skips: Skip[]) {
    for (const skip of skips) {
      if (skip.customLogic) {
        this.evalService.register(skip.id, skip.customLogic)
      }
    }
  }

  /**
   * Check if the supplied skipConditions should return a 'skip' value. This is the only method responsible for
   * evaluating skip condtions
   * @param {Skip[]} skips - Skips as defined by the form blueprint
   * @param {Set<string>} conditionTags - A Set of existing condition names
   * @returns {boolean}
   */
  shouldSkip(skips: Skip[], conditionTags: Set<string>): boolean
  shouldSkip(
    skips: Skip[],
    conditionTags: Set<string>,
    interview: InterviewManager,
    location: InterviewLocation,
    cache: Map<any, any>,
  ): boolean

  shouldSkip (
    skips: Skip[],
    conditionTags: Set<string>,
    interview?: InterviewManager,
    location?: InterviewLocation,
    cache?: Map<any, any>,
  ): boolean {
    if (cache) {
      cache.clear()
    }
    let shouldShow = true
    const api = this.evalService.size() > 0 && interview ? createSkipApi(interview, location, cache) : undefined
    for (const skip of skips) {
      if (skip.customLogic) {
        shouldShow = this.evalService.run(skip.id, api)
        if (shouldShow) {
          break
        }
      } else if (skip.showHide) {
        // Show
        if (!skip.anyAll) {
          // Show if any are true
          shouldShow = false
          for (const condition of skip.conditionTags) {
            if (conditionTags.has(condition.conditionTagName)) {
              shouldShow = true
              break
            }
          }
        } else {
          // Show if all are true
          shouldShow = true
          for (const condition of skip.conditionTags) {
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
          for (const condition of skip.conditionTags) {
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
          for (const condition of skip.conditionTags) {
            if (!conditionTags.has(condition.conditionTagName)) {
              shouldShow = true
              break
            }
          }
        }
      }
      if ((skip.showHide && shouldShow) || (!skip.showHide && !shouldShow)) {
        // Positive show result or positive hide result
        break
      }
    }
    return !shouldShow
  }
}
