import ConditionAssignmentService from '@/services/ConditionAssignmentService'

describe('ConditionAssignmentService.js', () => {
  it('should register and handle a single function', () => {
    const cass = new ConditionAssignmentService()
    const arg1 = 'test is ok'
    cass.register('question1', 'function (args) { return args }')
    expect(cass.eval('question1', arg1)).to.deep.equal(arg1, 'The argument returns was not the same as the argument passed in')
  })
  it('should handle multiple functions', () => {
    const cass = new ConditionAssignmentService()
    const arg1 = 'test 1'
    const arg2 = 'test 2'
    cass.register('question1', `function (args) { return '${arg1}' }`)
    cass.register('question2', `function (args) { return '${arg2}' }`)
    expect(cass.eval('question1', arg1)).to.deep.equal(arg1, 'The argument passed in to question1 did not match the argument returned')
    expect(cass.eval('question2', arg2)).to.deep.equal(arg2, 'The argument passed in to question2 did not match the argument returned')
  })
})
