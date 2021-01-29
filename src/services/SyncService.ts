import Sync from '../entities/trellis-config/Sync'
import uuid from 'uuid/v4'
import DatabaseService from './database/DatabaseService'
import DeviceService from './device/DeviceService'
import { syncInstance } from './http/AxiosInstance'
import { AxiosRequestConfig, CancelTokenSource } from 'axios'
import { Connection } from 'typeorm'
import LoginService from '../services/login'
import SingletonService from './SingletonService'

/**
 * Max number of rows to write to upload file at a time.
 * Memory vs performance trade off.
 **/
const UPLOAD_NUM_ROWS_WRITE = 100

class SyncService {

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
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get(`heartbeat`, options)
    return resp.data
  }

  async authenticate (source: CancelTokenSource, deviceId: string) {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceId}/syncv2/authenticate`, options)
    return resp.data
  }

  async getLatestSnapshot (source: CancelTokenSource) {
    const deviceId = await DeviceService.getUUID()
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceId}/syncv2/snapshot`, options)
    return resp.data
  }

  async listUploads () {
    const http = await syncInstance()
    return http.get(`list-uploads`)
  }

  async getMissingPhotos (source?: CancelTokenSource) {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceId}/missing-images`, options)
    return resp.data
  }

  async getPendingUploads (source: CancelTokenSource) {
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const resp = await http.get(`device/${deviceId}/uploads`, options)
    return resp.data
  }

  async getSnapshotFileSize (source: CancelTokenSource, snapshotId: string): Promise<number> {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    const resp = await http.get(`device/${deviceId}/snapshot/${snapshotId}/file_size`, options)
    return resp.data
  }

  async getImageFileList (source: CancelTokenSource, fileNames: string[]): Promise<string[]> {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    const resp = await http.post(`device/${deviceId}/image_size`, fileNames, options)
    return resp.data
  }

  async downloadImage (source: CancelTokenSource, fileName: string): Promise<any> {
    let options = {
      timeout: 0,
      responseType: 'blob'
    } as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    return http.get(`device/${deviceId}/image/${fileName}`, options)
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
    // Log out user, un-set study, locale (in case User, Study, Locale tables have changed)
    await LoginService.logout()
    SingletonService.set('study', null)
    SingletonService.set('locale', null)
    // TODO: is this necessary
    SingletonService.set('user', null)
  }

  async registerCancelledSync (_sync: Sync): Promise<void> {
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {status: 'cancelled'})
  }

  async verifyUpload (fileEntry, md5hash) {
    const deviceId = await DeviceService.getUUID()
    const http = await syncInstance()
    const uri = `/device/${deviceId}/verify-upload`
    return http.post(uri, {
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

  async getUpdatedPhotos (connection:Connection, rowIds:string[]): Promise<object[]> {
    const results = await connection.query(`select file_name from photo where id in (${rowIds});`)
    return results.map((row) => row.file_name)
  }

  async markUpdatedRowsAsUploaded () {
    const connection = await DatabaseService.getDatabase()
    return connection.query(`update updated_records set uploaded_at = date('now') where uploaded_at is null;`)
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

    const totalRowResults = await connection.query(`
      select count(*) as total_rows from (
        select distinct updated_record_id, table_name from updated_records where uploaded_at is null
      );`)

    const totalRows = totalRowResults[0]['total_rows']
    const tables = await connection.query(
      'select table_name as tableName, count(*) as rowCount ' +
      'from (select distinct updated_record_id, table_name from updated_records ' +
      'where uploaded_at is null) ' +
      'group by table_name;')

    const fileWriter = await this.createFileWriter(fileEntry)
    let writtenRows = 0
    let updatedPhotos = []

    for (const table of tables) {
      let rowIds = await connection.query(`
        select distinct updated_record_id from updated_records where table_name = ? and uploaded_at is null
      `,[table.tableName])
      rowIds = rowIds.map((row) => row.updated_record_id)
      while (rowIds.length > 0) {
        let subsetRowIds = rowIds.splice(0, UPLOAD_NUM_ROWS_WRITE)
        subsetRowIds = subsetRowIds.map((rowId) => { return '"' + rowId + '"' }).join(',')
        const updatedRows = await this.getUpdatedRows(connection, table.tableName, subsetRowIds)
        if (table.tableName === 'photo') {
          updatedPhotos = await this.getUpdatedPhotos(connection, subsetRowIds)
        }
        await this.writeUpdatedRows(fileWriter, updatedRows, isCancelled)
        writtenRows += updatedRows.length
        trackProgress({created: writtenRows, total: totalRows})
      }
    }

    return updatedPhotos
  }

  async getNewPhotosCount (): Promise<number> {
    const conn = await DatabaseService.getDatabase()
    const res = await conn.query('select count(*) as c from updated_records where table_name = "photo"')
    return res[0].c
  }

}

export default new SyncService()
