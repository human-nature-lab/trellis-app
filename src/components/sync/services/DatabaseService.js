import DeviceService from '../../../services/DeviceService.js'
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
    this.database = window.sqlitePlugin.openDatabase({
      name: 'trellis.db',
      location: 'default'
    }, db => {
      db.sqlBatch([
        SyncTable.getCreateTableStatement(),
        SyncMessage.getCreateTableStatement(),
        Message.getCreateTableStatement(),
        Config.getCreateTableStatement()
      ],
      () => {
        console.log('Database initialized')
      },
      error => {
        console.error(error)
      })
      this.database = db
      this.isReady = true
      console.log('connection to db opened', db)
    }, error => {
      // TODO: Pass in an alert service and display an alert to the user
      console.log('Open database ERROR: ' + JSON.stringify(error))
    })
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

export default new DatabaseService()
