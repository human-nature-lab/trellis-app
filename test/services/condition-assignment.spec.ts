import './globals'
import {expect} from 'chai'
import Form from '../../src/entities/trellis/Form'

import ConditionAssignmentService from '../../src/services/SaferEvalService'
import { FormBuilder } from '../FormBuilder'
import { SectionTemplate } from '../FormBuilderTypes'
import { InterviewController } from '../InterviewController'

function time (func, n = 5000) {
  let i = n
  let start = performance.now()
  while (i--) {
    func()
  }
  return performance.now() - start
}

export default function () {
  describe('ConditionAssignmentService', () => {
    it('should register and handle a single function', () => {
      const cass = new ConditionAssignmentService()
      const arg1 = 'test is ok'
      cass.register('question1', 'function (args) { return args }')
      expect(cass.run('question1', arg1)).to.deep.equal(arg1, 'The argument returns was not the same as the argument passed in')
    })
    it('should handle multiple functions', () => {
      const cass = new ConditionAssignmentService()
      const arg1 = 'test 1'
      const arg2 = 'test 2'
      cass.register('question1', `function (args) { return '${arg1}' }`)
      cass.register('question2', `function (args) { return '${arg2}' }`)
      expect(cass.run('question1', arg1)).to.deep.equal(arg1, 'The argument passed in to question1 did not match the argument returned')
      expect(cass.run('question2', arg2)).to.deep.equal(arg2, 'The argument passed in to question2 did not match the argument returned')
    })
    it('should handle unregistering', () => {
      const cass = new ConditionAssignmentService()
      cass.register('question1', `'empty inside'`)
      expect(cass.conditionAssignmentMethods.get('question1')).to.not.be.undefined
      cass.unregister('question1')
      expect(cass.conditionAssignmentMethods.get('question1')).to.be.undefined
    })
    it('should return false for an unregistered event', () => {
      const cass = new ConditionAssignmentService()
      expect(cass.run('test')).to.be.false
    })
    it('should be faster than calling eval inline', function (this: any) {
      this.timeout(20 * 1000)
      const cass = new ConditionAssignmentService()
      let func = `function (val) { 
      var a = val + 2;
      function res (v) {
        for (let i = 0; i < v + 1; i++) {
          v += 1
          i++
        }
        return v
      }  
   return res(a)}`
      cass.register('test1', func)
      function testCass () {
        cass.run('test1', 1000)
      }
      function testEval () {
        eval(`(${func})(1000)`)
      }
      let cassTime = time(testCass)
      let evalTime = time(testEval)
      // console.log(cassTime, evalTime)
      expect(cassTime).to.be.lessThan(evalTime, 'Wow... This managed to be slower somehow O.o')
    })

    describe('api', async () => {
      const form = await import('../forms/condition-assignment-api-form-builder.json')
      // const builder = FormBuilder.fromTemplate(require('../forms/condition-assignment-api').default)
      // debugger
      const builder = new FormBuilder(new Form().fromSnakeJSON(form))
      console.log(JSON.stringify(builder.form, null, 2))
      console.log(JSON.stringify(builder.form.toSnakeJSON({ includeRelationships: true }), null, 2))
      it('should handle looking up data anywhere in the form', async () => {
        const controller = new InterviewController(builder.form)
        await controller.load()
        controller.validateLocation({ page: 0 })
        await controller.selectNChoice()
        await controller.next({ page: 1 })
        const firstConditionTags = ['ran_first', 'api_for_first_is_same']
        controller.matchConditionTags(firstConditionTags)
        controller.hasNoConditionAssignmentErrors()
        await controller.selectNChoice()
        await controller.next({ page: 2 })
        const secondConditionTags = firstConditionTags.concat(['second_saw_first_question_datum', 'second_saw_first_condition_tag'])
        controller.matchConditionTags(secondConditionTags)
        await controller.selectNChoice()
        await controller.selectNChoice(1)
        await controller.selectNChoice(2)
        await controller.next({ section: 1, page: 0 })
        await controller.selectNChoice()
        await controller.next({ section: 1, page: 1 })
        controller.matchConditionTags(secondConditionTags.concat(['first_repetition']))
        await controller.selectNChoice(0)
        await controller.next({ section: 1, page: 0, sectionFollowUpRepetition: 1 })
        await controller.selectNChoice()
        await controller.next({ section: 1, page: 1, sectionFollowUpRepetition: 1 })
        controller.matchConditionTags(secondConditionTags.concat(['second_repetition', 'had_previous']))
        await controller.next({ section: 1, page: 0, sectionFollowUpRepetition: 2 })
      })
      it('should get data for current section in follow up sections')
    })
  })

}
