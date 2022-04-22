import { UserServiceWeb } from './UserServiceWeb'
import { UserServiceCordova } from './UserServiceCordova'

export const webService = new UserServiceWeb()
export const cordovaService = new UserServiceCordova()

export default cordovaService
