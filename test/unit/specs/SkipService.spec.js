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
  // it('should handle all vs any', () => {
  //   let skipConditions = [{
  //     show_hide
  //   }]
  //   let conditionTags = new Set(['wasda', 'hasda', 'canca'])
  //   expect(SkipService.shouldSkipPage(skipConditions, conditionTags)).to.be.false()
  // })
})
