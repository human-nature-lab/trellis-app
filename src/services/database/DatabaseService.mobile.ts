import DeviceService from '../device'
import { Entity, EntitySchema, ObjectType, QueryRunner, createConnection, getConnection } from 'typeorm'
import asyncForEach from '../../classes/AsyncForEach'
import Config from '../../entities/trellis-config/Config'
import Sync from '../../entities/trellis-config/Sync'
import FileService from '../file'
import SnakeCaseNamingStrategy from './SnakeCaseNamingStrategy'
import config from '../../config'
import { delay } from '../../classes/delay'
import { Mutex } from 'async-mutex'
import { trellisConfigEntities, trellisEntities } from './entities'

enum DB {
  CONFIG = 'trellis-config',
  TRELLIS = 'trellis'
}
const trellisConfigOptions = {
  type: 'cordova',
  database: DB.CONFIG,
  name: DB.CONFIG,
  location: 'default',
  entities: trellisConfigEntities,
  logging: (config.database && config.database.logging !== null) ? config.database.logging : ['error'],
  synchronize: true,
}

const trellisOptions = {
  type: 'cordova',
  database: DB.TRELLIS,
  name: DB.TRELLIS,
  location: 'default',
  entities: trellisEntities,
  namingStrategy: new SnakeCaseNamingStrategy(),
  // logging: ['warning', 'error'] // reduced logging
  // logging: true // verbose logging
  logging: (config.database && config.database.logging !== null) ? config.database.logging : ['query', 'warning', 'error']
}

console.log('database configs', trellisConfigOptions, trellisOptions)

interface SnapshotProgress {
  inserted: number
  total: number
}

type SnapshotProgressCallback = (progress: SnapshotProgress) => any

export default class DatabaseServiceCordova {
  private configMutex = new Mutex()
  private defaultMutex = new Mutex()
  constructor () {
    this.createDatabase()
    this.createConfigDatabase()
  }

  async createDatabase () {
    const release = await this.defaultMutex.acquire()
    try {
      await DeviceService.isDeviceReady()
      const connection = await createConnection(trellisOptions)
      const queryRunner = connection.createQueryRunner()
      await this.createUpdatedRecordsTable(queryRunner, { message: null })
    } finally {
      release()
    }
  }

  async getDatabase () {
    const release = await this.defaultMutex.acquire()
    try {
      return getConnection(DB.TRELLIS)
    } finally {
      release()
    }
  }

  async tableExists (table: string) {
    const conn = await this.getDatabase()
    const res = await conn.query(`select name from sqlite_master where type="table" and name="${table}"`)
    return res && res.length && res[0].name.toLowerCase() === table
  }

  async closeDatabase (timeout = 2000): Promise<boolean> {
    const conn = await this.getDatabase()
    let hasTimedOut = false
    setTimeout(() => {
      hasTimedOut = true
    }, timeout)
    while (!hasTimedOut) {
      if (conn.isConnected) {
        await conn.close()
        return true
      }
      await delay(100)
    }
    return false
  }

  async getRepository<T> (entity: string | EntitySchema<T> | ObjectType<T>) {
    const conn = await this.getDatabase()
    return conn.getRepository(entity)
  }

  async getConfigRepository<T> (entity: string | EntitySchema<T> | ObjectType<T>) {
    const conn = await this.getConfigDatabase()
    return conn.getRepository(entity)
  }

  async createConfigDatabase () {
    const release = await this.configMutex.acquire()
    try {
      await DeviceService.isDeviceReady()
      await createConnection(trellisConfigOptions)
    } finally {
      release()
    }
  }

  async getConfigDatabase () {
    const release = await this.configMutex.acquire()
    try {
      return getConnection(DB.CONFIG)
    } finally {
      release()
    }
  }

 

  async createUpdatedRecordsTable (queryRunner: QueryRunner, status: { message: string }) {
    try {
      const q = `create table if not exists updated_records 
      (table_name text, updated_record_id text, uploaded_at datetime);`
      await queryRunner.query(q)
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
      const tableNames: string[] = tableNameResults.map((tableNameObject) => {
        return tableNameObject.tbl_name
      }).filter(n => n !== 'sqlite_sequence')
      console.log('tableNames', tableNames)
      await asyncForEach(tableNames, async tableName => {
        if (tableName !== 'updated_records') {
          await asyncForEach(operations, async operation => {
            const q = `
            create trigger if not exists trigger__updated_records__${operation}__${tableName}
            after ${operation} on ${tableName}
            BEGIN
              insert into updated_records (table_name, updated_record_id) values ('${tableName}',NEW.id);
            END;`
            await queryRunner.query(q)
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
      const query = `
      SELECT 'DROP TABLE "' || name || '";' as query FROM "sqlite_master" 
      WHERE "type" = 'table' AND "name" != 'sqlite_sequence'`
      const dropQueries = await queryRunner.query(query)
      await Promise.all(dropQueries.map(q => queryRunner.query(q.query)))
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
      const fileSize = file.size
      let end = Math.min(fileSize, (start + CHUNK_SIZE))
      let inQuotes = false
      let escaped = false
      let buffer = ''
      fileReader.onload = async function (event) {
        try {
          trackProgress({ inserted: start, total: fileSize })
          buffer += decoder.decode(event.target.result, { stream: true })
          for (let curChar = 0; curChar < buffer.length; curChar++) {
            const char = buffer.charAt(curChar)
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
                const query = buffer.substring(0, (curChar + 1))
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
              const slice = file.slice(start, end)
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
      const slice = file.slice(start, end)
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
    const config = await repository.findOne({ where: { name: 'serverIP' } })
    return !config ? undefined : config.val
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
      .where('type = :type', { type: 'download' })
      .andWhere('status = :status', { status: 'success' })
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getLatestUpload (): Promise<Sync> {
    const connection = await this.getConfigDatabase()
    const repository = connection.getRepository(Sync)
    const queryBuilder = repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', { type: 'upload' })
      .where('status = :status', { status: 'success' })
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getUpdatedRecordsCount (): Promise<number> {
    const connection = await this.getDatabase()
    const totalRowResults = await connection.query(
      `select count(distinct updated_record_id) as total_rows
        from updated_records
        where uploaded_at is null;`)
    return totalRowResults[0].total_rows
  }

  async getDatabaseFileUri (): Promise<string> {
    return `/data/data/edu.yale.trellis.surveyview/databases/${trellisConnection.database}`
  }

  async getConfigDatabaseFileUri (): Promise<string> {
    return `/data/data/edu.yale.trellis.surveyview/databases/${trellisConfigConnection.database}`
  }
}
