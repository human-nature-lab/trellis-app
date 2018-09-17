import SkipService from '../../src/components/interview/services/SkipService'
import {expect} from 'chai'
import Skip from "../../src/entities/trellis/Skip";

export default function () {
  describe('SkipService', () => {
    it('should handle show vs hide with no conditions', () => {
      let skipCondition = new Skip().fromSnakeJSON({
        show_hide: true,
        any_all: true,
        conditions: []
      })
      let conditionTags = new Set()
      for (let anyAll of [true, false]) {
        skipCondition.anyAll = anyAll
        skipCondition.showHide = true
        expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "show" condition should skip if no condition tags are present. any_all: ${anyAll}`)
        skipCondition.showHide = false
        expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "hide" condition should not skip if no conditions tags are present. any_all: ${anyAll}`)
      }
    })
    it('should handle show vs hide with one condition tag', () => {
      let skipCondition = new Skip().fromSnakeJSON({
        show_hide: true,
        any_all: true,
        conditions: [{
          id: 'wasda',
          name: 'wasda'
        }]
      })
      let conditionTags = new Set(['wasda'])
      for (let anyAll of [true, false]) {
        skipCondition.anyAll = anyAll
        skipCondition.showHide = true
        expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show" condition for a single condition tag should never be skipped if that condition exists`)
        skipCondition.showHide = false
        expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide" condition for a single condition tag should always be hidden in that condition exists`)
      }
    })
    it('should handle all vs any with show and hide', () => {
      let skipCondition = new Skip().fromSnakeJSON({
        show_hide: true,
        any_all: true,
        conditions: [{
          id: 'wasda',
          name: 'wasda'
        }, {
          id: 'hasda',
          name: 'hasda'
        }]
      })
      let conditionTags = new Set(['wasda', 'hasda', 'canca'])
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if any" condition should be shown if any conditions match`)
      skipCondition.showHide = false
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if any" condition should be hidden if any conditions match`)
      conditionTags = new Set(['wasda', 'canca'])
      skipCondition.showHide = true
      // Show if any conditions exist
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if any" condition should be shown if any conditions match`)
      skipCondition.showHide = false
      // hide if any conditions exist
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if any" condition should be hidden if any conditions match`)
      skipCondition.showHide = true
      skipCondition.anyAll = false
      // show if all conditions exist
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "show if all" condition should be hidden if all of the conditions don't match`)
      skipCondition.showHide = false
      // Hide if all conditions exist
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "hide if all" condition should be shown if all conditions don't match`)
      conditionTags = new Set(['wasda', 'hasda'])
      skipCondition.showHide = true
      skipCondition.anyAll = false
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if all" condition should be shown if all conditions match`)
      skipCondition.showHide = false
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if all" condition should be hidden if all conditions match`)
    })
    it('should exit on the first show condition', () => {
      // let skipConditions = [{
      //   any_all: true,
      //   show_hide: false
      // }]
    })
  })
}
