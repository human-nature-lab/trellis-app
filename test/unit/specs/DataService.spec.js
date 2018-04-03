import {DataService} from '@/factories/ServiceFactory'
import describeInEachEnv from '../util'

describeInEachEnv(`DataService.spec`, (env) => {
  describe(`DataService.${env}.spec`, () => {
    it('Should have the correct interface', () => {
      expect(DataService.getLocales).to.not.be.undefined
      expect(DataService.getForm).to.not.be.undefined
    })
  })
})
