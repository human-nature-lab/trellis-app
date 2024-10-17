import { FileService } from './FileService'
import { FileService as FileServiceCordova } from './FileService.mobile'

export default new FileService() as FileServiceCordova
