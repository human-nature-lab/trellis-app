import storage from '@/services/storage/StorageService'
describe('StorageService.spec', () => {
  before(() => {
    window.localStorage.clear()
    window.localStorage.setItem('test-val', JSON.stringify({d: 'onetwothree', t: 'string'}))
  })
  it('should return a value in local storage if it exists', () => {
    let val = storage.get('test-val')
    expect(val).to.equal('onetwothree', 'It did not get the value from local storage')
  })
  it('should return null if the value does not exist in memory or in local storage', () => {
    expect(storage.get('bad-val', 'string')).to.be.null
  })
  it('should store different types of values', () => {
    storage.set('test-object', {a: 1, b: 2})
    expect(storage.get('test-object', 'object')).to.deep.equal({a: 1, b: 2})
    storage.set('test-string', 'test-string')
    expect(storage.get('test-string', 'string')).to.equal('test-string', 'It did not return the correct value')
  })
})
