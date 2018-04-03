import { DeviceService } from '@/services/device/DeviceService'
import SyncTable from '../models/SyncTable'
import SyncMessage from '../models/SyncMessage'
import Message from '../models/Message'
import Config from '../models/Config'

class DatabaseService {
  constructor () {
    this.database = null
    this.isReady = false
    console.log('database waiting for device to be ready')
    DeviceService.isDeviceReady().then(
      () => {
        console.log('device is ready initializing database')
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
    })
    this.isReady = true
    console.log('connection to db opened', this.database)
  }

  getLatestSnapshot () {
    return this.getDatabase().then(db =>
      db.executeSql('SELECT count(*) AS sscount from snapshot', [],
          result => {
            console.log(result.rows.item(0).sscount)
          },
          error => {
            console.log(error)
          })
    )
  }
}

export default DatabaseService
