import switchByModeEnv from '@/services/util'
import PhotoServiceWeb from './PhotoServiceWeb'
import PhotoServiceMock from './PhotoServiceMock'
import PhotoServiceCordova from './PhotoServiceCordova'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: PhotoServiceWeb,
    TEST: PhotoServiceMock
  },
  CORDOVA: {
    PROD: PhotoServiceCordova,
    TEST: PhotoServiceMock
  }
})

export const PhotoService = Constructor

export default PhotoService
