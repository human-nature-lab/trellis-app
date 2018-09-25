import SkipService from '../../src/components/interview/services/SkipService'
import {expect} from 'chai'
import Skip from "../../src/entities/trellis/Skip";

function anyAllString (val: boolean): string {
  return val ? 'all' : 'any'
}

function showHideString (val: boolean): string {
  return val ? 'show' : 'hide'
}

function shouldHide (skips: Skip[], conditions: Set<string>): void {
  expect(SkipService.shouldSkipPage(skips, conditions)).to.equal(true, 'This page should hide')
}

function shouldShow (skips: Skip[], conditions: Set<string>): void {
  expect(SkipService.shouldSkipPage(skips, conditions)).to.equal(false, 'This page should show')
}

interface SkipHelper extends Skip {
  show (): this
  hide (): this
  any (): this
  all (): this
}

function makeSkip (conditions: string[]): SkipHelper {
  let skip = new Skip().fromSnakeJSON({
    show_hide: true,
    any_all: true,
    conditions: conditions.map(c => ({
      id: c,
      condition_tag_name: c
    }))
  })

  // @ts-ignore
  skip.show = function () {
    skip.showHide = true
    return skip
  }
  // @ts-ignore
  skip.hide = function () {
    skip.showHide = false
    return skip
  }
  // @ts-ignore
  skip.any = function () {
    skip.anyAll = false
    return skip
  }
  // @ts-ignore
  skip.all = function () {
    skip.anyAll = true
    return skip
  }

  return skip as SkipHelper
}

export default function () {
  describe('SkipService', () => {
    it('should show if there are no skips on the page', () => {
      shouldShow([], new Set())
    })
    describe('show', () => {
      describe('any', () => {
        it('should hide if no conditions are present', () => {
          shouldHide([makeSkip(['one']).show().any()], new Set([]))
        })
        it('should show if any condition is present', () => {
          shouldShow([makeSkip(['one']).show().any()], new Set(['one']))
          shouldShow([makeSkip(['one', 'two']).show().any()], new Set(['one']))
          shouldShow([makeSkip(['one', 'two']).show().any()], new Set(['two']))
        })
        it('should hide if no conditions are present', () => {
          shouldHide([makeSkip(['one']).show().any()], new Set(['two']))
        })
      })
      describe('all', () => {
        it('should hide if no conditions are present', () => {
          shouldHide([makeSkip(['one']).show().all()], new Set([]))
        })
        it('should show if all conditions are present', () => {
          shouldShow([makeSkip(['one', 'two']).show().all()], new Set(['one', 'two']))
          shouldShow([makeSkip(['one', 'two']).show().all()], new Set(['one', 'two', 'three']))
        })
        it('should hide if all conditions are not present', () => {
          shouldHide([makeSkip(['one', 'two']).show().all()], new Set(['one']))
          shouldHide([makeSkip(['one', 'two']).show().all()], new Set(['two']))
          shouldHide([makeSkip(['one', 'two']).show().all()], new Set(['three']))
        })
      })
    })
    describe('hide', () => {
      describe('any', () => {
        it('should show if no conditions are present', () => {
          shouldShow([makeSkip(['one']).hide().any()], new Set([]))
        })
        it('should hide if any conditions are present', () => {
          shouldHide([makeSkip(['one']).hide().any()], new Set(['one']))
          shouldHide([makeSkip(['one', 'two']).hide().any()], new Set(['one']))
          shouldHide([makeSkip(['one', 'two']).hide().any()], new Set(['two']))
          shouldHide([makeSkip(['one', 'two']).hide().any()], new Set(['two', 'three']))
        })
        it('should show if no conditions are present', () => {
          shouldShow([makeSkip(['one']).hide().any()], new Set(['two']))
          shouldShow([makeSkip(['one', 'two']).hide().any()], new Set(['three', 'four']))
        })
      })
      describe('all', () => {
        it('should show if no conditions are present', () => {
          shouldShow([makeSkip(['one']).hide().all()], new Set([]))
        })
        it('should hide if all conditions are present', () => {
          shouldHide([makeSkip(['one']).hide().all()], new Set(['one']))
          shouldHide([makeSkip(['one', 'two']).hide().all()], new Set(['one', 'two']))
          shouldHide([makeSkip(['one', 'two', 'three']).hide().all()], new Set(['one', 'two', 'three', 'four', 'five']))
        })
        it('should show if all conditions are not present', () => {
          shouldShow([makeSkip(['one']).hide().all()], new Set(['two']))
          shouldShow([makeSkip(['one', 'two']).hide().all()], new Set(['two', 'three']))
          shouldShow([makeSkip(['one', 'two']).hide().all()], new Set(['one', 'three']))
        })
      })
    })
  })
}
