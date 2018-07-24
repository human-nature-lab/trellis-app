import { DeviceService } from '@/services/device/DeviceService'
import 'reflect-metadata'
import { createConnection, getConnection } from 'typeorm'
import Config from '@/entities/trellis-config/Config'
import Message from '@/entities/trellis-config/Message'
import Sync from '@/entities/trellis-config/Sync'
import SyncMessage from '@/entities/trellis-config/SyncMessage'
import UpdatedRecords from '@/entities/trellis-config/UpdatedRecords'
import Photo from '@/entities/trellis/Photo'

const trellisConfigConnection = {
  type: 'cordova',
  database: 'trellis-config',
  name: 'trellis-config',
  location: 'default',
  entities: [
    Config,
    Message,
    Sync,
    SyncMessage,
    UpdatedRecords
  ],
  logging: true,
  synchronize: true
}

const trellisConnection = {
  type: 'cordova',
  database: 'trellis',
  name: 'trellis',
  location: 'default',
  entities: [
    Photo
  ],
  // logging: ['warning', 'error'], // reduced logging
  logging: true // verbose logging
}

export default class DatabaseServiceCordova {
  constructor () {
    this.databaseCreated = DatabaseServiceCordova.createDatabase()
    this.configDatabaseCreated = DatabaseServiceCordova.createConfigDatabase()
  }

  static createDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConnection))
  }

  async getDatabase () {
    await this.databaseCreated
    return getConnection('trellis')
  }

  static createConfigDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConfigConnection))
  }

  async getConfigDatabase () {
    await this.configDatabaseCreated
    return getConnection('trellis-config')
  }

  removeDatabase () {
    return this.getDatabase()
      .then((connection) => connection.dropDatabase())
  }

  executeSnapshot (queryRunner, extractedSnapshot, trackProgress, isCancelled) {
    return new Promise((resolve, reject) => {
      extractedSnapshot.file((file) => {
        let decoder = new TextDecoder()
        let start = 0
        const CHUNK_SIZE = 1024000
        let fileSize = file.size
        let end = Math.min(fileSize, (start + CHUNK_SIZE))
        let fileReader = new FileReader(file)
        let inQuotes = false
        let escaped = false
        let buffer = ''
        fileReader.onload = async function (event) {
          trackProgress({inserted: start, total: fileSize})
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
        }
        fileReader.onerror = (error) => { reject(error) }
        let slice = file.slice(start, end)
        fileReader.readAsArrayBuffer(slice)
      })
    })
  }

  async importDatabase (extractedSnapshot, trackProgress, isCancelled) {
    let connection = await this.getDatabase()
    let queryRunner = await connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.query('PRAGMA foreign_keys = OFF;')
    await queryRunner.startTransaction()
    try {
      await this.executeSnapshot(queryRunner, extractedSnapshot, trackProgress, isCancelled)
      if (!isCancelled()) {
        await queryRunner.commitTransaction()
      }
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.query('PRAGMA foreign_keys = ON;')
    }
  }

  checkForeignKeys () {
    return this.getDatabase()
      .then((connection) => connection.query('PRAGMA foreign_key_check;'))
  }

  async getLatestDownload () {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const queryBuilder = await repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', {type: 'download'})
      .where('status = :status', {status: 'success'})
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getLatestUpload () {
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

  async getUpdatedRecordsCount () {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(UpdatedRecords)
    return await repository.count({ uploadedAt: null })
  }
}
