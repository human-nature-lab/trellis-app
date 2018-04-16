import SkipService from '@/components/interview/services/SkipService'
describe('SkipService.spec', () => {
  it('should handle show vs hide with no conditions', () => {
    let skipCondition = {
      show_hide: true,
      any_all: true,
      conditions: []
    }
    let conditionTags = new Set()
    for (let anyAll of [true, false]) {
      skipCondition.any_all = anyAll
      skipCondition.show_hide = true
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "show" condition should skip if no condition tags are present. any_all: ${anyAll}`)
      skipCondition.show_hide = false
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "hide" condition should not skip if no conditions tags are present. any_all: ${anyAll}`)
    }
  })
  it('should handle show vs hide with one condition tag', () => {
    let skipCondition = {
      show_hide: true,
      any_all: true,
      conditions: [{
        id: 'wasda',
        name: 'wasda'
      }]
    }
    let conditionTags = new Set(['wasda'])
    for (let anyAll of [true, false]) {
      skipCondition.any_all = anyAll
      skipCondition.show_hide = true
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show" condition for a single condition tag should never be skipped if that condition exists`)
      skipCondition.show_hide = false
      expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide" condition for a single condition tag should always be hidden in that condition exists`)
    }
  })
  it('should handle all vs any with show and hide', () => {
    let skipCondition = {
      show_hide: true,
      any_all: true,
      conditions: [{
        id: 'wasda',
        name: 'wasda'
      }, {
        id: 'hasda',
        name: 'hasda'
      }]
    }
    let conditionTags = new Set(['wasda', 'hasda', 'canca'])
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if any" condition should be shown if any conditions match`)
    skipCondition.show_hide = false
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if any" condition should be hidden if any conditions match`)
    conditionTags = new Set(['wasda', 'canca'])
    skipCondition.show_hide = true
    // Show if any conditions exist
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if any" condition should be shown if any conditions match`)
    skipCondition.show_hide = false
    // hide if any conditions exist
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if any" condition should be hidden if any conditions match`)
    skipCondition.show_hide = true
    skipCondition.any_all = false
    // show if all conditions exist
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "show if all" condition should be hidden if all of the conditions don't match`)
    skipCondition.show_hide = false
    // Hide if all conditions exist
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "hide if all" condition should be shown if all conditions don't match`)
    conditionTags = new Set(['wasda', 'hasda'])
    skipCondition.show_hide = true
    skipCondition.any_all = false
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(false, `A "show if all" condition should be shown if all conditions match`)
    skipCondition.show_hide = false
    expect(SkipService.shouldSkipPage([skipCondition], conditionTags)).to.equal(true, `A "hide if all" condition should be hidden if all conditions match`)
  })
  it('should exit on the first show condition', () => {
    // let skipConditions = [{
    //   any_all: true,
    //   show_hide: false
    // }]
  })
})
