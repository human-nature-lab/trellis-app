import Emitter from '@/classes/Emitter'

describe('Emitter.js', () => {
  it('should emit in the order that callbacks were appended', () => {
    const emitter = new Emitter()
    const results = []
    emitter.on('test', function () {
      results.push(0)
    })
    emitter.on('test', function () {
      results.push(1)
    })
    emitter.on('test', function () {
      results.push(2)
    })
    emitter.dispatch('test')
    expect(results).to.deep.equal([0, 1, 2], 'Emitted order did not match the order of the callbacks')
  })
  it('should apply the correct context for events', () => {
    const emitter = new Emitter()
    let resA = null
    let resB = null
    let a = { name: 'a' }
    let b = { name: 'b' }
    emitter.on('test', function () {
      resA = this.name
    }, a)
    emitter.on('test', function () {
      resB = this.name
    }, b)
    emitter.dispatch('test')
    expect(resA).to.equal(a.name, 'Context was not applied correctly for a')
    expect(resB).to.equal(b.name, 'Context was not applied correctly for b')
  })
  it('should remove the callback correctly', () => {
    const emitter = new Emitter()
    let val = 0
    function test () {
      val++
    }
    emitter.on('test', test)
    emitter.dispatch('test')
    expect(val).to.equal(1, 'callback was not called correctly')
    emitter.off('test', test)
    emitter.emit('test')
    expect(val).to.equal(1, 'callback was still called after being removed')
  })
  it('should fail to register the same event twice', () => {
    const emitter = new Emitter()
    function register () {
      emitter.register('test')
      emitter.register('test')
    }
    expect(register).to.throw(Error, 'An event with this name has already been registered', 'Incorrectly allowed the emitter to register the same function twice')
  })
  it('should fail to remove a callback from an unregistered event', () => {
    const emitter = new Emitter()
    function failToRemove () {
      emitter.off('test', function () {})
    }
    expect(failToRemove).to.throw(Error, 'An event with this name has not been registered yet', 'Incorrectly allowed the emitter to try to remove a function on an event that does not exist yet')
  })
  it('should pass the correct arguments using dispatch and dispatchApply', () => {
    const emitter = new Emitter()
    const arg1 = {a: 'wow'}
    const arg2 = {b: 'amaze'}
    emitter.on('test', function (tArg1, tArg2) {
      expect(tArg1).to.equal(arg1, 'The first argument does not match')
      expect(tArg2).to.equal(arg2, 'The second argument does not match')
    })
    emitter.dispatch('test', arg1, arg2)
    emitter.dispatchApply('test', [arg1, arg2])
  })
})
