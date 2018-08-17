import switchByModeEnv from '../util'
import PhotoServiceWeb from './PhotoServiceWeb'
import PhotoServiceCordova from './PhotoServiceCordova'

let Constructor = switchByModeEnv({
  WEB: PhotoServiceWeb,
  CORDOVA: PhotoServiceCordova
})

export const PhotoService = Constructor

export default new PhotoService()
