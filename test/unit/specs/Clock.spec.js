import Clock from '@/classes/Clock'
function testSequence (clock, sequence) {
  for (let e of sequence) {
    for (let operation of Object.keys(e)) {
      clock[operation]()
      expect(clock.time).to.deep.equal(e[operation], 'The value should be this after ' + operation + 'ing')
    }
  }
}
describe('Clock.spec', () => {
  it('should be able to represent military time', () => {
    testSequence(new Clock([11, 58], [23, 59]), [{
      increment: [11, 59]
    }, {
      increment: [12, 0]
    }, {
      decrement: [11, 59]
    }, {
      decrement: [11, 58]
    }])
  })
  it('should be able to represent AM/PM time', () => {
    testSequence(new Clock([0, 11, 58], [1, 11, 59], [0, 0, 0]), [{
      increment: [0, 11, 59]
    }, {
      increment: [1, 0, 0]
    }, {
      decrement: [0, 11, 59]
    }, {
      decrement: [0, 11, 58]
    }])
  })
  it('should handle static values between incrementing values', () => {
    testSequence(new Clock([11, 0, 0, 58], [23, 0, 0, 59]), [{
      increment: [11, 0, 0, 59]
    }, {
      increment: [12, 0, 0, 0]
    }, {
      decrement: [11, 0, 0, 59]
    }, {
      decrement: [11, 0, 0, 58]
    }])
    testSequence(new Clock([11, 1, 1, 58], [23, 1, 1, 59], [0, 1, 1, 0]), [{
      increment: [11, 1, 1, 59]
    }, {
      increment: [12, 1, 1, 0]
    }, {
      decrement: [11, 1, 1, 59]
    }, {
      decrement: [11, 1, 1, 58]
    }])
  })
  it('should validate the initial time', () => {
    expect(() => {
      return new Clock([12, 189], [11, 14])
    }).to.throw()
    expect(() => {
      return new Clock([10, 10000000], null, [11, 14])
    }).to.throw()
  })
  it('should set isAtMin and isAtMax at the beginning', () => {
    let clock = new Clock([3, 4])
    expect(clock.isAtMax).to.equal(false, 'isAtMax should be false if under the default max of 9')
    expect(clock.isAtMin).to.equal(false, 'isAtMin should be false if above the default min of 0')
    clock = new Clock([3, 4], [3, 4])
    expect(clock.isAtMax).to.equal(true, 'isAtMax should be true if we are at the defined max value')
    expect(clock.isAtMin).to.equal(false, 'isAtMin should be false if we above the default min of 0')
    clock = new Clock([3, 4], [4, 4], [3, 4])
    expect(clock.isAtMax).to.equal(false, 'isAtMax should be false if we are below the defined max value')
    expect(clock.isAtMin).to.equal(true, 'isAtMin should be true if we are at the defined min value')
    clock = new Clock([2, 2], [2, 2], [2, 2])
    expect(clock.isAtMax).to.equal(true, 'isAtMax should be true if we are at the max value')
    expect(clock.isAtMin).to.equal(true, 'isAtMin should be true if we are at the min value')
  })
  it('should set isAtMin and isAtMax as you move through the survey', () => {
    let clock = new Clock([1, 0], [2, 1], [0, 0])
    expect([clock.isAtMin, clock.isAtMax]).to.deep.equal([false, false], 'Both min and max should be false at the beginning')
    clock.increment()
    expect(clock.isAtMax).to.equal(false, 'The max value should not be true yet')
    clock.increment()
    clock.increment()
    expect(clock.isAtMax).to.equal(true, 'The max value should be true since we have reached the max value')
    clock = new Clock([1, 0], [2, 1], [0, 0])
    clock.decrement()
    expect(clock.isAtMin).to.equal(false, 'The min value should not be true yet')
    clock.decrement()
    expect(clock.isAtMin).to.equal(true, 'The min value should be true since we have reached the min value')
  })
  it('should not exceed the min and max boundaries', () => {
    let clock = new Clock([9, 9])
    clock.increment()
    expect(clock.time).to.deep.equal([9, 9], 'The clock did not stay within the default max boundary')
    clock = new Clock([0, 0])
    clock.decrement()
    expect(clock.time).to.deep.equal([0, 0], 'The clock did not stay within the default min boundary')
    clock = new Clock([1, 1], [1, 1])
    clock.increment()
    expect(clock.time).to.deep.equal([1, 1], 'The clock did not stay within the clockMax boundary')
    clock = new Clock([1, 1], null, [1, 1])
    clock.decrement()
    expect(clock.time).to.deep.equal([1, 1], 'The clock did not stay within the clockMin boundary')
  })
})
