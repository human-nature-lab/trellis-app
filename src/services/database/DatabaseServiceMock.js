import { DeviceService } from '@/services/device/DeviceService'
import SyncTable from './tables/SyncTable'
import SyncMessage from './tables/SyncMessage'
import Message from './tables/Message'
import UpdatedRecords from './tables/UpdatedRecords'
import Config from './tables/Config'

export default class DatabaseService {
  constructor () {
    this.database = null
    this.isReady = false
    // console.log('database waiting for device to be ready')
    DeviceService.isDeviceReady().then(
      () => {
        // console.log('device is ready initializing database')
        this.initDatabase()
      }
    )
  }

  getDatabase () {
    return new Promise(resolve => {
      const checkReady = () => {
        if (this.isReady) {
          resolve(this.database)
        } else {
          setTimeout(checkReady)
        }
      }
      checkReady()
    })
  }

  initDatabase () {
    this.database = window.openDatabase('trellis.db', '1.0', 'Trellis Database', 1024 * 1024 * 5)
    this.database.transaction((tx) => {
      tx.executeSql(SyncTable.getCreateTableStatement(), [])
      tx.executeSql(SyncMessage.getCreateTableStatement(), [])
      tx.executeSql(Message.getCreateTableStatement(), [])
      tx.executeSql(Config.getCreateTableStatement(), [])
      tx.executeSql(UpdatedRecords.getCreateTableStatement(), [])
    }, function (error) {
      console.error('initDatabase error: ', error)
    }, function () {
      // console.log('initialized database successfully')
    })
    this.isReady = true
    // console.log('connection to db opened', this.database)
  }

  getLatestDownload () {
    return new Promise((resolve, reject) => {
      this.getDatabase().then(db =>
        db.transaction((tx) =>
          tx.executeSql('SELECT * from sync where type = "download" and status = "success" order by created_at desc limit 1', [],
            function (t, data) {
              resolve(data.rows)
            },
            function (error) {
              reject(error)
            })
        )
      )
    })
  }

  getLatestUpload () {
    return new Promise((resolve, reject) => {
      this.getDatabase().then(db =>
        db.transaction((tx) =>
          tx.executeSql('SELECT * from sync where type = "upload" and status = "success" order by created_at desc limit 1', [],
            function (t, data) {
              resolve(data.rows)
            },
            function (error) {
              reject(error)
            })
        )
      )
    })
  }

  getUpdatedRecordsCount () {
    return new Promise((resolve, reject) => {
      this.getDatabase().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT count(*) AS urcount FROM updated_records', [],
            function (t, data) {
              resolve(data.rows[0].urcount)
            },
            function (error) {
              reject(error)
            })
        })
      })
    })
  }
}
