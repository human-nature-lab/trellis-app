import DatabaseService from '../database'
import config from '../../config'
import DeviceService from '../device'

declare const FileTransfer

export default async function BackupDatabase (progressCb?: (completed: number, total: number) => any) {
  const host: string = await DatabaseService.getServerIPAddress()
  const databaseUri: string = await DatabaseService.getDatabaseFileUri()
  const deviceId: string = await DeviceService.getUUID()
  return new Promise((resolve, reject) => {
    const fileTransfer = new FileTransfer()
    fileTransfer.onprogress = (event: ProgressEvent) => {
      if (progressCb) {
        progressCb(event.loaded, event.total)
      }
    }
    fileTransfer.upload(databaseUri, `${host}/sync/device/${deviceId}/database/backup`,
      resolve,
      reject,
      { params: { fileName: 'trellis' }, headers: { 'X-Key': config.xKey } })
  })

}
