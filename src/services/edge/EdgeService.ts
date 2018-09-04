import switchByModeEnv from '../util'
import EdgeServiceWeb from './EdgeServiceWeb'
import EdgeServiceCordova from './EdgeServiceCordova'
// import EdgeServiceMock from './EdgeServiceMock'

let Constructor = switchByModeEnv({
  WEB: EdgeServiceWeb,
  CORDOVA: EdgeServiceCordova
})

export const EdgeService = Constructor

export default new EdgeService()
