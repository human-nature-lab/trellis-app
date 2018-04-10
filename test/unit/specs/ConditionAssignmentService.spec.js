import ConditionAssignmentService from '@/services/ConditionAssignmentService'

function time (func, n = 30000) {
  let i = n
  let start = performance.now()
  while (i--) {
    func()
  }
  return performance.now() - start
}

describe('ConditionAssignmentService.js', () => {
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
    expect(cass.conditionAssignmentMethods['question1']).to.not.be.undefined
    cass.unregister('question1')
    expect(cass.conditionAssignmentMethods['question1']).to.be.undefined
  })
  it('should return false for an unregistered event', () => {
    const cass = new ConditionAssignmentService()
    expect(cass.run('test')).to.be.false
  })
  it('should be faster than calling eval inline', function () {
    this.timeout(20 * 1000)
    const cass = new ConditionAssignmentService()
    cass.register('test1', `function (val) { return val ++ }`)
    function testCass () {
      cass.run('test1', 100)
    }
    function testEval () {
      self.eval('(function (val) { return val ++ })(100)')
    }
    let cassTime = time(testCass)
    let evalTime = time(testEval)
    // console.log(cassTime, evalTime)
    expect(cassTime).to.be.lessThan(evalTime, 'Wow... This managed to be slower somehow O.o')
  })
})
