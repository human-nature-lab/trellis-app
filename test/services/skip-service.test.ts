import SkipService from '../../src/services/SkipService'
import InterviewManager from '../../src/components/interview/classes/InterviewManager'
import { expect } from 'chai'
import Skip from '../../src/entities/trellis/Skip'
import { uniqueId } from 'lodash'
import { createForm, createFormData } from './util'
import Interview from '../../src/entities/trellis/Interview'
import Form from '../../src/entities/trellis/Form'
import QuestionDatum from '../../src/entities/trellis/QuestionDatum'
import Datum from '../../src/entities/trellis/Datum'

function anyAllString (val: boolean): string {
  return val ? 'all' : 'any'
}

function showHideString (val: boolean): string {
  return val ? 'show' : 'hide'
}

function shouldHide (skips: Skip[], conditions: Set<string>, interview?: InterviewManager): void {
  const service = new SkipService()
  service.register(skips)
  expect(service.shouldSkip(skips, conditions, interview)).to.equal(true, 'This page should hide')
}

function shouldShow (skips: Skip[], conditions: Set<string>, interview?: InterviewManager): void {
  const service = new SkipService()
  service.register(skips)
  expect(service.shouldSkip(skips, conditions, interview)).to.equal(false, 'This page should show')
}

interface SkipHelper extends Skip {
  show(): this
  hide(): this
  any(): this
  all(): this
}

function makeSkip (conditions: string[]): SkipHelper {
  const skip = new Skip().fromSnakeJSON({
    show_hide: true,
    any_all: true,
    conditions: conditions.map(c => ({
      id: c,
      condition_tag_name: c,
    })),
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

function customSkip (logic: string): Skip {
  return new Skip().fromSnakeJSON({
    id: uniqueId(),
    custom_logic: logic,
  })
}

export default function () {
  describe('SkipService', () => {
    it('should show if there are no skips on the page', () => {
      shouldShow([], new Set())
    })
    describe('single skip', () => {
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
    describe('multiple skips', () => {
      describe('show', () => {
        it('should show at the first positive show result', () => {
          shouldShow([
            makeSkip(['one']).show().all(),
            makeSkip(['two']).show().any(),
          ], new Set(['two']))
          shouldShow([
            makeSkip(['one']).hide().any(),
            makeSkip(['two']).show().any(),
            makeSkip(['three']).show().any(),
          ], new Set(['two']))
          shouldShow([
            makeSkip(['two']).show().any(),
            makeSkip(['three']).show().any(),
          ], new Set(['two']))
          shouldShow([
            makeSkip(['two', 'three']).show().all(),
            makeSkip(['two', 'four']).show().all(),
          ], new Set(['two', 'four', 'five']))
        })
        it('should hide at the first positive hide result', () => {
          shouldHide([
            makeSkip(['one']).hide().all(),
            makeSkip(['two']).hide().any(),
          ], new Set(['two']))
          shouldHide([
            makeSkip(['one']).show().any(),
            makeSkip(['two']).hide().any(),
            makeSkip(['three']).hide().any(),
          ], new Set(['two']))
          shouldHide([
            makeSkip(['two']).hide().any(),
            makeSkip(['three']).hide().any(),
          ], new Set(['two']))
        })
      })
    })
    describe('simple custom logic', () => {
      it('should show when return true;', () => {
        shouldShow([customSkip('function () { return true; }')], new Set())
      })
      it('should hide when return false;', () => {
        shouldHide([customSkip('function () { return false; }')], new Set())
      })
    })
    describe('custom vars access', async () => {
      const form = createForm({
        sections: [{
          pages: [{
            questions: [{
              var_name: 'hello',
            }, {
              var_name: 'foo',
            }],
          }],
        }],
      })
      const data = createFormData(form, [{
        varName: 'hello',
        data: [{ val: 'world' }],
      }, {
        varName: 'foo',
        data: [{ val: 'bar' }],
      }])
      console.log('form data', form, data)
      const manager = new InterviewManager(new Interview(), form, [], data)
      await manager.initialize()
      shouldShow([customSkip(`function ({ vars }) { 
        console.log('vars.hello', vars.hello);
        return vars.hello === 'world';
      }`)], new Set(), manager)
      shouldHide([customSkip('function ({ vars }) { return vars.foo === \'nobar\'; }')], new Set(), manager)
    })
  })
}
