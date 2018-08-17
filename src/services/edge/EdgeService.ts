import switchByModeEnv from '../util'
import EdgeServiceWeb from './EdgeServiceWeb'
import EdgeServiceCordova from './EdgeServiceCordova'
import EdgeServiceMock from './EdgeServiceMock'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: EdgeServiceWeb,
    TEST: EdgeServiceMock
  },
  CORDOVA: {
    PROD: EdgeServiceCordova,
    TEST: EdgeServiceMock
  }
})

export const EdgeService = Constructor

export default new EdgeService()
