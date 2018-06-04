import DataService from '@/services/data/DataService'

describe(`DataService.spec`, () => {
  it('Should have the correct interface', () => {
    expect(DataService.getLocales).to.not.be.undefined
    expect(DataService.getConditions).to.not.be.undefined
  })
})
