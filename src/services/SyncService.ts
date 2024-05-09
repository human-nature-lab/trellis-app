import uuid from 'uuid/v4'
import { AxiosRequestConfig, CancelTokenSource } from 'axios'
import { Connection } from 'typeorm'
import Sync from '../entities/trellis-config/Sync'
import DatabaseService from './database'
import DeviceService from './device'
import { requestSyncAuthentication, syncInstance } from './http/AxiosInstance'
import LoginService from './login'
import SingletonService, { StorageKey } from './SingletonService'
import { parseISO } from 'date-fns'
import Snapshot from '@/entities/trellis/Snapshot'
import { filetransfer } from '@/cordova/filetransfer'
import { FSDirectoryEntry, FSFileEntry } from '@/cordova/file'
import { Mutex } from 'async-mutex'
import { merge } from 'lodash'

/**
 * Max number of rows to write to upload file at a time.
 * Memory vs performance trade off.
 **/
const UPLOAD_NUM_ROWS_WRITE = 100

class SyncService {
  private deviceData: {
    deviceUUID: string
    deviceKey: string
    apiAddress: string
  }

  private mut = new Mutex()

  public async getDeviceInfo () {
    if (this.deviceData) {
      return this.deviceData
    }
    return this.mut.runExclusive(async () => {
      if (this.deviceData) {
        return this.deviceData
      }
      const [deviceUUID, deviceKey, apiAddress] = await Promise.all([
        DeviceService.getUUID(),
        DeviceService.getDeviceKey(),
        DatabaseService.getServerIPAddress(),
      ])
      this.deviceData = { deviceUUID, deviceKey, apiAddress }
      return this.deviceData
    })
  }

  async createSync (type: string, deviceId: string): Promise<Sync> {
    const sync = new Sync()
    sync.id = uuid()
    sync.type = type
    sync.status = 'running'
    sync.deviceId = deviceId
    sync.fileName = ''
    sync.createdAt = new Date()
    const connection = await DatabaseService.getConfigDatabase()
    await connection.manager.save(sync)
    return sync
  }

  async getHeartbeat (source: CancelTokenSource) {
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get('heartbeat', options)
    return resp.data
  }

  async getServerTime (deviceId: string) {
    const http = await syncInstance()
    const res = await http.get(`device/${deviceId}/server-time`)
    return parseISO(res.data.time)
  }

  async authenticate (source: CancelTokenSource, deviceId: string) {
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceId}/syncv2/authenticate`, options)
    return resp.data
  }

  async getLatestSnapshot (source?: CancelTokenSource): Promise<Snapshot> {
    const { deviceUUID } = await this.getDeviceInfo()
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceUUID}/syncv2/snapshot`, options)
    return new Snapshot().fromSnakeJSON(resp.data)
  }

  async listUploads () {
    const http = await syncInstance()
    return http.get('list-uploads')
  }

  async getMissingPhotos (source?: CancelTokenSource) {
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceUUID}/missing-images`, options)
    return resp.data as string[]
  }

  async getMissingAssets (source?: CancelTokenSource) {
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceUUID}/missing-assets`, options)
    return resp.data as string[]
  }

  async getPendingUploads (source: CancelTokenSource) {
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const resp = await http.get(`device/${deviceUUID}/uploads`, options)
    return resp.data
  }

  async getSnapshotFileSize (source: CancelTokenSource, snapshotId: string): Promise<number> {
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceUUID}/snapshot/${snapshotId}/file_size`, options)
    return resp.data
  }

  async getImageFileList (source: CancelTokenSource, fileNames: string[]) {
    type Res = {
      'total_size': number
      'photos_requested': number
      'is_estimate': number
      'photos_found': number
    }
    const options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const resp = await http.post(`device/${deviceUUID}/image_size`, fileNames, options)
    return resp.data as Res
  }

  async downloadImage (source: CancelTokenSource, fileName: string): Promise<any> {
    const options = {
      timeout: 0,
      responseType: 'blob',
    } as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const res = await http.get(`device/${deviceUUID}/image/${fileName}`, options)
    if (res.status > 300) {
      throw new Error('Unable to download image')
    }
    return res
  }

  async downloadImageTo (imageFileName: string, imageDir: FSDirectoryEntry) {
    const { apiAddress, deviceUUID, deviceKey } = await this.getDeviceInfo()
    const url = `${apiAddress}/sync/device/${deviceUUID}/image/${imageFileName}`
    const authHeader = await requestSyncAuthentication()
    const photo = await imageDir.getFile(imageFileName, { create: true })
    return filetransfer.download(url, photo.toURL(), false, {
      headers: {
        Authorization: authHeader,
        'X-Key': deviceKey,
      },
    })
  }

  async downloadAssetTo (assetId: string, dir: FSDirectoryEntry) {
    const { apiAddress, deviceUUID, deviceKey } = await this.getDeviceInfo()
    const url = `${apiAddress}/sync/device/${deviceUUID}/asset/${assetId}`
    const authHeader = await requestSyncAuthentication()
    const file = await dir.getFile(assetId, { create: true })
    return filetransfer.downloadEntry(url, file, false, {
      headers: {
        Authorization: authHeader,
        'X-Key': deviceKey,
      },
    })
  }

  async uploadEntry (path: string, entry: FSFileEntry, opts?: FileUploadOptions) {
    const { deviceKey, apiAddress } = await this.getDeviceInfo()
    const authHeader = await requestSyncAuthentication()
    const url = new URL(apiAddress)
    url.pathname = path
    const uploadOpts = merge({}, {
      headers: {
        Authorization: authHeader,
        'X-Key': deviceKey,
      },
    }, opts)

    return filetransfer.uploadEntry(url.toString(), entry, uploadOpts)
  }

  async hasSynced (): Promise<boolean> {
    const repository = await DatabaseService.getConfigRepository(Sync)
    const downloadCount = await repository.count({
      type: 'download',
      status: 'success',
    })
    return (downloadCount > 0)
  }

  async registerSuccessfulSync (_sync: Sync): Promise<void> {
    const repository = await DatabaseService.getConfigRepository(Sync)
    await repository.update({ id: _sync.id }, {
      completedAt: new Date(),
      status: 'success',
      snapshotCreatedAt: _sync.snapshotCreatedAt,
    })
    // Log out user, un-set study, locale (in case User, Study, Locale tables have changed)
    await LoginService.logout()
    SingletonService.set(StorageKey.study, null)
    SingletonService.set(StorageKey.locale, null)
    // TODO: is this necessary
    SingletonService.set(StorageKey.user, null)
  }

  async registerCancelledSync (_sync: Sync): Promise<void> {
    const repository = await DatabaseService.getConfigRepository(Sync)
    await repository.update({ id: _sync.id }, { status: 'cancelled' })
  }

  async verifyUpload (fileEntry, md5hash) {
    const { deviceUUID } = await this.getDeviceInfo()
    const http = await syncInstance()
    const uri = `/device/${deviceUUID}/verify-upload`
    return http.post(uri, {
      fileName: fileEntry.name,
      md5hash: md5hash,
    })
  }

  async writeUpdatedRows (fileWriter, updatedRows, isCancelled) {
    return new Promise<void>((resolve, reject) => {
      let curRow = 0

      fileWriter.onwriteend = function () {
        curRow++
        if (curRow < updatedRows.length && (!isCancelled())) {
          fileWriter.seek(fileWriter.length)
          fileWriter.write(JSON.stringify(updatedRows[curRow]) + '\n')
        } else {
          resolve()
        }
      }

      fileWriter.onerror = function (err) { reject(err) }

      fileWriter.write(JSON.stringify(updatedRows[curRow]) + '\n')
    })
  }

  async getRowsToUpdate (connection:Connection, tableName:string, limit:number, offset:number): Promise<string[]> {
    // TODO: should this be select distinct
    const rowIdObjects = await connection.query('select updated_record_id from updated_records ' +
      'where table_name = ? ' +
      'and uploaded_at is null ' +
      'limit ? offset ?', [tableName, limit, offset])
    return rowIdObjects.map((rowIdObject) => { return '"' + rowIdObject.updated_record_id + '"' }).join(',')
  }

  async getUpdatedRows (connection:Connection, tableName:string, rowIds:string[]): Promise<object[]> {
    return connection.query(`select *, "${tableName}" as table_name from ${tableName} where id in (${rowIds});`)
  }

  async getUpdatedPhotos (connection:Connection, rowIds:string[]): Promise<string[]> {
    const results = await connection.query(`select file_name from photo where id in (${rowIds});`)
    return results.map((row) => row.file_name)
  }

  async markUpdatedRowsAsUploaded () {
    const connection = await DatabaseService.getDatabase()
    return connection.query('update updated_records set uploaded_at = date(\'now\') where uploaded_at is null;')
  }

  async createUploadFile (fileEntry: FSFileEntry, trackProgress, isCancelled) {
    const connection = await DatabaseService.getDatabase()

    const totalRowResults = await connection.query(`
      select count(*) as total_rows from (
        select distinct updated_record_id, table_name from updated_records where uploaded_at is null
      );`)

    const totalRows = totalRowResults[0].total_rows
    const tables = await connection.query(
      'select table_name as tableName, count(*) as rowCount ' +
      'from (select distinct updated_record_id, table_name from updated_records ' +
      'where uploaded_at is null) ' +
      'group by table_name;')

    const fileWriter = await fileEntry.createWriter()
    let writtenRows = 0
    let updatedPhotos = []
    let updatedAssets = []

    for (const table of tables) {
      let rowIds = await connection.query(`
        select distinct updated_record_id from updated_records where table_name = ? and uploaded_at is null
      `, [table.tableName])
      rowIds = rowIds.map((row) => row.updated_record_id)
      while (rowIds.length > 0) {
        if (isCancelled()) return
        const chunkRowIds = rowIds.splice(0, UPLOAD_NUM_ROWS_WRITE)
        const subsetRowIds = chunkRowIds.map((rowId) => { return '"' + rowId + '"' }).join(',')
        const updatedRows = await this.getUpdatedRows(connection, table.tableName, subsetRowIds)
        if (table.tableName === 'photo') {
          updatedPhotos = await this.getUpdatedPhotos(connection, subsetRowIds)
        } else if (table.tableName === 'asset') {
          updatedAssets = chunkRowIds.slice()
        }
        await fileWriter.writeLines(updatedRows.map(v => JSON.stringify(v)))
        // await this.writeUpdatedRows(fileWriter, updatedRows, isCancelled)
        writtenRows += updatedRows.length
        trackProgress({ created: writtenRows, total: totalRows })
      }
    }

    return { updatedPhotos, updatedAssets }
  }

  async getNewPhotosCount (): Promise<number> {
    const conn = await DatabaseService.getDatabase()
    const res = await conn.query('select count(*) as c from updated_records where table_name = "photo"')
    return res[0].c
  }
}

export default new SyncService()
