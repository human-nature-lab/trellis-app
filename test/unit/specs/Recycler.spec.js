import Recycler from '@/classes/Recycler'

class TestRecycler extends Recycler {
  keyExtractor (obj) {
    return Object.keys(obj).join('-.-')
  }
  objectCreator (...params) {
    let obj = {}
    for (let key in params) {
      obj[key] = params[key]
    }
    return obj
  }
}

describe('Recycler.spec', () => {
  let testRecycler = new TestRecycler()
  it('should fail without being extended', () => {
    let recycler = new Recycler()
    expect(function () { recycler.get('key') }).to.throw('Object creator must be defined to use this class')
    expect(function () { recycler.fill([{}]) }).to.throw('Define a key extractor before using the fill method')
  })
  it(`should create a new version of the object if it doesn't exist`, () => {
    expect(testRecycler.get('1', 'param1', 'param2')).to.deep.equal({
      '0': 'param1',
      '1': 'param2'
    }, 'these two should be the same')
  })
  it('should use an old version of the object', () => {
    expect(testRecycler.get('1')).to.deep.equal({
      '0': 'param1',
      '1': 'param2'
    }, 'these two should be the same')
  })
  it('should use an old object without a key', () => {
    expect(testRecycler.getNoKey('param1', 'param2')).to.deep.equal({
      '0': 'param1',
      '1': 'param2'
    }, 'these two should be the same')
  })
})
