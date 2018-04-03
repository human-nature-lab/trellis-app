import config, {ENV_TYPE} from '@/config'

describe('ServiceFactory', () => {
  it('should import without errors', () => {
    return require('@/factories/ServiceFactory')
  })
  it('should import the same reference each time a service is imported', () => {
    config.environment = ENV_TYPE.CORDOVA
    const ServiceFactory = require('@/factories/ServiceFactory')
    const FormService = require('@/services/cordova/FormService.cordova').default
    expect(ServiceFactory.FormService).to.not.be.null
    console.log(FormService, ServiceFactory.FormService)
    expect(ServiceFactory.FormService).to.be.eql(FormService, 'The ServiceFactory did not require the correct version of the FormService')
  })
  it('should import the correct service for each environment', () => {
    expect(true).to.be.false
  })
  afterEach(() => {
    // Reset to test environment
    config.environment = ENV_TYPE.TEST
  })
})
