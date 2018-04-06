import StringInterpolationService from '@/services/StringInterpolationService'

describe('StringInterpolationService.spec', () => {
  it('should interpolate a single "fill"', () => {
    let varName = 'fdasfeeq12346'
    let getMsg = (v) => {
      return `testing message with lots ${v} of text`
    }
    let msg = getMsg(`[${varName}]`)
    let varMap = {[varName]: 'winner'}
    expect(StringInterpolationService.interpolate(msg, varMap)).to.deepEqual(getMsg(varMap[varName]), "interpolation didn't work correctly")
  })
  it('should interpolate multiple fills', () => {
    expect(StringInterpolationService.interpolate(`[asdfficilxls][asdf;;;kjsaldf][/nhkloij,njjklmsadfqew{}]`, {
      'asdfficilxls': 'ok',
      'asdf;;;kjsaldf': 'ok2',
      '/nhkloij,njjklmsadfqew{}': 'ok3'
    })).to.deepEqual('okok2ok3')
  })
})
