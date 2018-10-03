import Sync from '../entities/trellis-config/Sync'
import uuid from 'uuid/v4'
import DatabaseService from './database/DatabaseService'
import DeviceService from './device/DeviceService'
import { syncInstance as http } from './http/AxiosInstance'
import {AxiosRequestConfig, AxiosResponse, CancelTokenSource} from "axios";
import {Connection} from 'typeorm'

/**
 * Max number of rows to write to upload file at a time.
 * Memory vs performance trade off.
 **/
const UPLOAD_NUM_ROWS_WRITE = 100

class SyncService {
  private deviceId: string

  constructor () {
    this.deviceId = DeviceService.getUUID()
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

  getHeartbeat (source: CancelTokenSource) {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return http().get(`heartbeat`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }

  authenticate (source: CancelTokenSource, deviceId: string) {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return http().get(`device/${deviceId}/syncv2/authenticate`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }

  getLatestSnapshot (source: CancelTokenSource) {
    return new Promise((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          let options = {} as AxiosRequestConfig
          if (source) { options.cancelToken = source.token }
          http().get(`device/${deviceId}/syncv2/snapshot`, options)
            .then(response => {
              resolve(response.data)
            })
            .catch((error) => {
              reject(error)
            })
        })
    })
  }

  listUploads () {
    return http().get(`list-uploads`)
  }

  getMissingPhotos (source: CancelTokenSource) {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return new Promise ((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          http().get(`device/${deviceId}/missing-images`, options)
            .then(response => {
              const missingImagesString = response.data
              resolve(missingImagesString)
            })
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }

  getPendingUploads (source: CancelTokenSource) {
    return new Promise((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          let options = {} as AxiosRequestConfig
          if (source) { options.cancelToken = source.token }
          http().get(`device/${deviceId}/uploads`, options)
            .then(response => {
              resolve(response.data)
            })
            .catch((error) => {
              reject(error)
            })
        })
    })
  }

  async getSnapshotFileSize (source: CancelTokenSource, snapshotId: string): Promise<number> {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const deviceId = await DeviceService.getUUID()
    return http().get(`device/${deviceId}/snapshot/${snapshotId}/file_size`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        throw err
      })
  }

  getImageFileList (source: CancelTokenSource, fileNames: string[]): Promise<string[]> {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return new Promise((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          http().post(`device/${deviceId}/image_size`, fileNames, options)
            .then(response => {
              resolve(response.data)
            })
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }

  downloadImage (source: CancelTokenSource, fileName: string): Promise<any> {
    let options = {
      timeout: 0,
      responseType: 'blob'
    } as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return DeviceService.getUUID()
      .then((deviceId) => http().get(`device/${deviceId}/image/${fileName}`, options))
  }

  async hasSynced (): Promise<boolean> {
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const downloadCount = await repository.count({
      type: 'download',
      status: 'success'
    })
    return (downloadCount > 0)
  }

  async registerSuccessfulSync (_sync: Sync): Promise<void> {
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {completedAt: new Date(), status: 'success'})
    /* TODO: For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }

  async registerCancelledSync (_sync: Sync): Promise<void> {
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {status: 'cancelled'})
    /* TODO: For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }

  async verifyUpload (fileEntry, md5hash) {
    const deviceId = await DeviceService.getUUID()
    const uri = `/device/${deviceId}/verify-upload`
    return http().post(uri, {
      fileName: fileEntry.name,
      md5hash: md5hash
    })
  }

  async writeUpdatedRows (fileWriter, updatedRows, isCancelled) {
    return new Promise((resolve, reject) => {
      let curRow = 0

      fileWriter.onwriteend = function() {
        curRow++
        if (curRow < updatedRows.length && (! isCancelled()) ) {
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

  createFileWriter (fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.createWriter(resolve, reject)
    })
  }

  async getRowsToUpdate (connection:Connection, tableName:string, limit:number, offset:number): Promise<string[]> {
    const rowIdObjects = await connection.query('select updated_record_id from updated_records ' +
      'where table_name = ? ' +
      'and uploaded_at is null ' +
      'limit ? offset ?', [tableName, limit, offset])
    return rowIdObjects.map((rowIdObject) => { return '"' + rowIdObject.updated_record_id + '"' }).join(',')
  }

  async getUpdatedRows (connection:Connection, tableName:string, rowIds:string[]): Promise<object[]> {
    return await connection.query(`select *, "${tableName}" as table_name from ${tableName} where id in (${rowIds});`)
  }

  async getUpdatedPhotos (connection:Connection, rowIds:string[]): Promise<object[]> {
    return await connection.query(`select file_name from photo where id in (${rowIds});`)
  }

  async markUpdatedRowsAsUploaded () {
    const connection = await DatabaseService.getDatabase()
    return await connection.query(`update updated_records set uploaded_at = date('now') where uploaded_at is null;`)
  }

  async createUploadFile (fileEntry, trackProgress, isCancelled) {
    const connection = await DatabaseService.getDatabase()

    /* For testing:
    const repository = await connection.getRepository(Geo)
    const entities = await repository.find({ take: 100 })
    entities.forEach((entity) => {
      repository.update({ id: entity.id }, { updatedAt: new Date() })
    })
    */

    const totalRowResults = await connection.query('select count(*) as total_rows from updated_records where uploaded_at is null;')
    const totalRows = totalRowResults[0]['total_rows']
    const tables = await connection.query(
      'select table_name as tableName, count(*) as rowCount ' +
      'from updated_records ' +
      'where uploaded_at is null ' +
      'group by table_name;')

    const fileWriter = await this.createFileWriter(fileEntry)
    let writtenRows = 0
    let updatedPhotos = []

    for (const table of tables) {
      let offset = 0
      while (offset < table.rowCount) {
        const rowIds = await this.getRowsToUpdate(connection, table.tableName, UPLOAD_NUM_ROWS_WRITE, offset)
        const updatedRows = await this.getUpdatedRows(connection, table.tableName, rowIds)
        if (table.tableName === 'photo') {
          updatedPhotos = await this.getUpdatedPhotos(connection, rowIds)
        }
        await this.writeUpdatedRows(fileWriter, updatedRows, isCancelled)
        offset += UPLOAD_NUM_ROWS_WRITE
        writtenRows += updatedRows.length
        trackProgress({created: writtenRows, total: totalRows})
      }
    }

    return updatedPhotos
  }

}

export default new SyncService()
