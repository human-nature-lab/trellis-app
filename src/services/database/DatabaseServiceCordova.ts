import DeviceService from '../device/DeviceService'
import 'reflect-metadata'
import { createConnection, Entity, getConnection, QueryRunner } from 'typeorm'
import asyncForEach from '../../classes/AsyncForEach'
import Config from '../../entities/trellis-config/Config'
import Sync from '../../entities/trellis-config/Sync'
import FileService from '../file/FileService'
import SnakeCaseNamingStrategy from './SnakeCaseNamingStrategy'
import config from 'config'
import { monekypatch } from './monekypatch'
import { requireAllModules } from '../../classes/requireAll'
monekypatch()

const trellisConfigConnection = {
  type: 'cordova',
  database: 'trellis-config',
  name: 'trellis-config',
  location: 'default',
  entities: requireAllModules(require.context('../../entities/trellis-config', true, /\.[tj]s$/)),
  logging: (config.database && config.database.logging !== null) ? config.database.logging : ['warning', 'error'],
  synchronize: true
}

const trellisConnection = {
  type: 'cordova',
  database: 'trellis',
  name: 'trellis',
  location: 'default',
  entities: requireAllModules(require.context('../../entities/trellis', true, /\.[tj]s$/)),
  namingStrategy: new SnakeCaseNamingStrategy(),
  // logging: ['warning', 'error'] // reduced logging
  // logging: true // verbose logging
  logging: (config.database && config.database.logging !== null) ? config.database.logging : ['warning', 'error']
}

interface SnapshotProgress {
  inserted: number
  total: number
}

type SnapshotProgressCallback = (progress: SnapshotProgress) => any

export default class DatabaseServiceCordova {
  private databaseCreated: Promise<void>
  private configDatabaseCreated: Promise<void>
  constructor () {
    this.databaseCreated = this.createDatabase()
    this.configDatabaseCreated = this.createConfigDatabase()
  }

  createDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConnection))
      .then((connection) => connection.createQueryRunner())
      .then((queryRunner) => this.createUpdatedRecordsTable(queryRunner, { message: null }))
  }

  async getDatabase () {
    await this.databaseCreated
    return getConnection('trellis')
  }

  async getRepository (entity: typeof Entity) {
    const conn = await this.getDatabase()
    return conn.getRepository(entity)
  }

  createConfigDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConfigConnection))
  }

  async getConfigDatabase () {
    await this.configDatabaseCreated
    return getConnection('trellis-config')
  }

  async getConfigRepository (entity: typeof Entity) {
    const conn = await this.getConfigDatabase()
    return conn.getRepository(entity)
  }

  async createUpdatedRecordsTable (queryRunner: QueryRunner, status: { message: string }) {
    try {
      await queryRunner.query(`create table if not exists updated_records (table_name text, updated_record_id text, uploaded_at datetime);`)
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async addTriggers (queryRunner: QueryRunner, status: { message: string }): Promise<void> {
    try {
      const operations = ['update', 'insert']
      const tableNameResults = await queryRunner.query('select tbl_name from SQLite_master where type = "table"')
      const tableNames: string[] = tableNameResults.map((tableNameObject) => { return tableNameObject['tbl_name'] }).filter(n => n !== 'sqlite_sequence')
      console.log('tableNames', tableNames)
      await asyncForEach(tableNames, async tableName => {
        if (tableName !== 'updated_records') {
          await asyncForEach(operations, async operation => {
            await queryRunner.query(
              `create trigger if not exists trigger__updated_records__${operation}__${tableName} 
               after ${operation} on ${tableName} 
                 BEGIN 
                   insert into updated_records (table_name, updated_record_id) values ('${tableName}',NEW.id);
                 END;`
            )
          })
        }
      })
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async removeDatabase (status: { message: string }): Promise<QueryRunner> {
    const connection = await this.getDatabase()
    const queryRunner = await connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.query('PRAGMA foreign_keys = OFF;')
    await queryRunner.startTransaction()
    try {
      const selectDropsQuery = `SELECT 'DROP TABLE "' || name || '";' as query FROM "sqlite_master" WHERE "type" = 'table' AND "name" != 'sqlite_sequence'`
      const dropQueries = await queryRunner.query(selectDropsQuery)
      await Promise.all(dropQueries.map(q => queryRunner.query(q['query'])))
      await queryRunner.query('PRAGMA foreign_keys = ON;')
      return queryRunner
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async executeSnapshot (queryRunner: QueryRunner, file: File, trackProgress: SnapshotProgressCallback , isCancelled: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const decoder = new TextDecoder()
      const fileReader = new FileReader(file)
      const CHUNK_SIZE = 1024000
      let start = 0
      let fileSize = file.size
      let end = Math.min(fileSize, (start + CHUNK_SIZE))
      let inQuotes = false
      let escaped = false
      let buffer = ''
      fileReader.onload = async function (event) {
        try {
          trackProgress({ inserted: start, total: fileSize })
          buffer += decoder.decode(event.target.result, {stream: true})
          for (let curChar = 0; curChar < buffer.length; curChar++) {
            let char = buffer.charAt(curChar)
            if (!escaped && char === '\'') {
              inQuotes = !inQuotes
            }
            if (escaped) {
              escaped = false
            } else {
              if (char === '\\') {
                escaped = true
              }
            }
            if (!inQuotes) {
              if (char === ';') {
                let query = buffer.substring(0, (curChar + 1))
                await queryRunner.query(query)
                buffer = buffer.substring(curChar + 1, buffer.length)
                curChar = 0
              }
            }
          }
          if (end < fileSize) {
            if (isCancelled()) {
              await queryRunner.rollbackTransaction()
              resolve()
            } else {
              start += CHUNK_SIZE
              end = Math.min(fileSize, (end + CHUNK_SIZE))
              let slice = file.slice(start, end)
              inQuotes = false
              escaped = false
              fileReader.readAsArrayBuffer(slice)
            }
          } else {
            resolve()
          }
        } catch (err) {
          console.error(err)
          reject(err)
        }
      }
      fileReader.onerror = (error) => { reject(error) }
      let slice = file.slice(start, end)
      fileReader.readAsArrayBuffer(slice)
    })
  }

  async importDatabase (queryRunner: QueryRunner, extractedSnapshot: string, trackProgress: SnapshotProgressCallback, isCancelled: () => boolean, status: { message: string }) {
    const file = await FileService.fileFromFileEntry(extractedSnapshot)
    try {
      await this.executeSnapshot(queryRunner, file, trackProgress, isCancelled)
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.query('PRAGMA foreign_keys = ON;')
    }
  }

  async checkForeignKeys (queryRunner: QueryRunner, status: { message: string }) {
    try {
      await queryRunner.query('PRAGMA foreign_key_check;')
      await queryRunner.commitTransaction()
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async getServerIPAddress (): Promise<string> {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Config)
    const config = await repository.findOne({name: 'serverIP'})
    return (config === undefined) ? undefined : config.val
  }

  async setServerIPAddress (combinedAddress: string): Promise<void> {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Config)
    const config = await this.getServerIPAddress()
    if (config === undefined) {
      await repository.insert({ name: 'serverIP', val: combinedAddress })
    } else {
      await repository.update({ name: 'serverIP' }, { val: combinedAddress })
    }
  }

  async getLatestDownload (): Promise<Sync> {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const queryBuilder = await repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', {type: 'download'})
      .andWhere('status = :status', {status: 'success'})
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getLatestUpload (): Promise<Sync> {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const queryBuilder = await repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', {type: 'upload'})
      .where('status = :status', {status: 'success'})
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getUpdatedRecordsCount (): Promise<number> {
    const connection = await this.getDatabase()
    /*
    const updatedRecords = await connection.query(
      `select *
        from updated_records
        where uploaded_at is null;`)
    console.log('updatedRecords', updatedRecords)
    */
    const totalRowResults = await connection.query(
      `select count(distinct updated_record_id) as total_rows
        from updated_records
        where uploaded_at is null;`)
    return totalRowResults[0]['total_rows']
  }

  async getDatabaseFileUri (): Promise<string> {
    return `/data/data/edu.yale.trellis.surveyview/databases/${trellisConnection.database}`
  }

  async getConfigDatabaseFileUri (): Promise<string> {
    return `/data/data/edu.yale.trellis.surveyview/databases/${trellisConfigConnection.database}`
  }
}
