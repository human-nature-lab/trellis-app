import StringInterpolationService from '@/services/StringInterpolationService'

describe('StringInterpolationService.spec', () => {
  it('should interpolate a single "fill"', () => {
    let varName = 'fdasfeeq12346'
    let msg = `testing message with lots [${varName}] of text`
    let varMap = {[varName]: 'winner'}
    expect(StringInterpolationService.interpolate(msg, varMap)).to.equal(`testing message with lots winner of text`, "interpolation didn't work correctly")
  })
  it('should interpolate multiple fills', () => {
    expect(StringInterpolationService.interpolate(`[asdfficilxls][asdf;;;kjsaldf][/nhkloij,njjklmsadfqew{}]`, {
      'asdfficilxls': 'ok',
      'asdf;;;kjsaldf': 'ok2',
      '/nhkloij,njjklmsadfqew{}': 'ok3'
    })).to.equal('okok2ok3')
  })
})
