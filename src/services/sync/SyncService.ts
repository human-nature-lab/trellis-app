import Sync from '../../entities/trellis-config/Sync'
import uuid from 'uuid/v4'
import DatabaseService from '../database/DatabaseService'
import { DeviceService } from '../device/DeviceService'
import { syncInstance as http } from '../http/AxiosInstance'
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

  getSnapshotFileSize (source: CancelTokenSource, snapshotId: string): Promise<number> {
    let options = {} as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    return http().get(`snapshot/${snapshotId}/file_size`, options)
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

  downloadSnapshot (source: CancelTokenSource, onDownloadProgress, snapshotId: string): Promise<AxiosResponse> {
    let options = {
      timeout: 0,
      responseType: 'blob'
    } as AxiosRequestConfig
    if (source) { options.cancelToken = source.token }
    if (onDownloadProgress) { options.onDownloadProgress = onDownloadProgress }
    return http().get(`snapshot/${snapshotId}/download`, options)
      .then(response => {
        return response
      })
      .catch(err => {
        console.error(err)
        throw err
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
    console.debug('sync', _sync)
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {completedAt: new Date(), status: 'success'})
    /* For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }

  async registerCancelledSync (_sync: Sync): Promise<void> {
    console.debug('sync', _sync)
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {status: 'cancelled'})
    /* For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }

  async writeUpdatedRows (fileWriter, updatedRows, isCancelled) {
    console.log('writeUpdatedRows')
    return new Promise((resolve, reject) => {
      let curRow = 0

      fileWriter.onwriteend = function() {
        console.log('fileWriter.onwriteend')
        curRow++
        console.log('curRow', curRow)
        console.log('updatedRows.length', updatedRows.length)
        console.log('isCancelled()', isCancelled())
        if (curRow < updatedRows.length && (! isCancelled()) ) {
          console.log('seeking end of file')
          fileWriter.seek(fileWriter.length)
          fileWriter.write(JSON.stringify(updatedRows[curRow]) + '\n')
        } else {
          resolve()
        }
      }

      fileWriter.onerror = function (err) { reject(err) }

      fileWriter.write(JSON.stringify(updatedRows[curRow]) + '\n')
      console.log('got here')
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

  async createUploadFile (fileEntry, trackProgress, isCancelled) {
    const connection = await DatabaseService.getDatabase()

    //await DatabaseService.createUpdatedRecordsTable(connection)
    //await DatabaseService.addTriggers(connection)

    /*
    const respondentRepository = await connection.getRepository(Respondent)
    const respondents = await respondentRepository.find({ take: 100 })
    respondents.forEach((respondent) => {
      respondentRepository.update({ id: respondent.id }, { geoNotes: 'Bar' })
    })
    */

    /*
    const repository = await configConnection.getRepository(UpdatedRecords)
    const updatedRecords = await repository.find()
    console.log('updatedRecords', updatedRecords)
    const queryBuilder = await repository.createQueryBuilder('updated_records')
    const totalRows = await queryBuilder.select('count(*)', 'updatedRecordCount')
      .where('uploaded_at is null')
      .getRawOne()
    const totalRows = await
    console.log('totalRows', totalRows)
    const tables = await queryBuilder.select('table_name', 'tableName')
      .addSelect('count(*)', 'rowCount')
      .where('uploaded_at is null')
      .groupBy('updated_records.table_name')
      .getRawMany()
    console.log('tables', tables)
    */
    const totalRowResults = await connection.query('select count(*) as total_rows from updated_records where uploaded_at is null;')
    const totalRows = totalRowResults[0]['total_rows']
    console.log('totalRows', totalRows)
    const tables = await connection.query(
      'select table_name as tableName, count(*) as rowCount ' +
      'from updated_records ' +
      'where uploaded_at is null ' +
      'group by table_name;')

    console.log('tables', tables)

    const fileWriter = await this.createFileWriter(fileEntry)
    let writtenRows = 0

    tables.forEach(async (table) => {
      let offset = 0
      while (offset < table.rowCount) {
        const rowIds = await this.getRowsToUpdate(connection, table.tableName, UPLOAD_NUM_ROWS_WRITE, offset)
        console.log('rowIds', rowIds)
        const updatedRows = await this.getUpdatedRows(connection, table.tableName, rowIds)
        console.log('updatedRows', updatedRows)
        await this.writeUpdatedRows(fileWriter, updatedRows, isCancelled)
        offset += UPLOAD_NUM_ROWS_WRITE
        writtenRows += updatedRows.length
        trackProgress({created: writtenRows, total: totalRows})
      }
    })
  }

}

export default new SyncService()
