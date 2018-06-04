import { DeviceService } from '@/services/device/DeviceService'
import SyncTable from './tables/SyncTable'
import SyncMessage from './tables/SyncMessage'
import Message from './tables/Message'
import UpdatedRecords from './tables/UpdatedRecords'
import Config from './tables/ConfigTable'
import 'reflect-metadata'
import {createConnection} from 'typeorm'

export default class DatabaseService {
  constructor () {
    this.configDatabase = null
    this.configIsReady = false
    this.database = null
    this.isReady = false
    this.insertBufferSize = 5242880
    DeviceService.isDeviceReady().then(
      () => {
        this.initConfigDatabase()
        this.initDatabase()
        this.testTypeorm()
      }
    )
  }

  testTypeorm () {
    createConnection({
      type: 'cordova',
      database: 'test',
      location: 'default',
      entities: [
      ],
      logging: true,
      synchronize: true
    }).then(async connection => {
      console.log(connection)
    })
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

  getConfigDatabase () {
    return new Promise(resolve => {
      const checkReady = () => {
        if (this.configIsReady) {
          resolve(this.configDatabase)
        } else {
          setTimeout(checkReady)
        }
      }
      checkReady()
    })
  }

  removeDatabase () {
    // In Cordova we'll delete the sqlite file and create a new database
    // in WebSQL we can't delete the database so let's remove all tables instead
    return new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          this.getDatabase()
            .then((db) => {
              let promises = []
              db.transaction((tx) => {
                tx.executeSql('select name from sqlite_master where type = "table"', [], (tx, res) => {
                  for (let i = 0; i < res.rows.length; i++) {
                    let tableName = res.rows.item(i).name
                    if (tableName !== '__WebKitDatabaseInfoTable__') {
                      promises.push(this.removeTable(tableName, tx))
                    }
                  }
                  Promise.all(promises)
                    .then(() => {
                      resolve()
                    },
                    (error) => {
                      reject(error)
                    })
                })
              })
            })
        })
    })
  }

  importDatabase (extractedSnapshot, trackProgress) {
    return new Promise((resolve, reject) => {
      if (!extractedSnapshot) {
        reject('No extracted snapshot provided')
      }
      this.getDatabase()
        .then((db) => {
          console.log('importDatabase', db)
          extractedSnapshot.file((file) => {
            let reader = new FileReader()
            reader.onloadend = function () {
              const loadedFile = this.result
              const allStatements = loadedFile.split(/;\n/)
              db.transaction((tx) => {
                allStatements.map((statement, i) => {
                  trackProgress({inserted: i, total: allStatements.length})
                  if (statement.trim() !== '') {
                    // console.log(statement, i)
                    tx.executeSql(statement, [],
                      (tx, resultSet) => {
                        // console.log('resultSet', resultSet)
                      },
                      (tx, error) => {
                        console.error(statement, error)
                      })
                  }
                })
              },
              (error) => {
                reject(error)
              },
              () => {
                resolve()
              })
            }
            reader.onerror = function (error) {
              reject(error)
            }
            reader.readAsText(file)
          })
        })
      console.log('extractedSnapshot', extractedSnapshot)
      resolve()
    })
  }

  removeTable (tableName, tx) {
    return new Promise((resolve, reject) => {
      console.log(`Dropping table ${tableName}`)
      tx.executeSql(`drop table ${tableName}`, [], () => {
        console.log(`Table ${tableName} dropped`)
        resolve()
      },
      (error) => {
        reject(error)
      })
    })
  }

  initConfigDatabase () {
    this.configDatabase = window.openDatabase('trellis-config.db', '1.0', 'Trellis Config Database', 1024 * 1024 * 5)
    this.configDatabase.transaction((tx) => {
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
    this.configIsReady = true
  }

  initDatabase () {
    this.database = window.openDatabase('trellis.db', '1.0', 'Trellis Database', 1024 * 1024 * 5)
    this.isReady = true
  }

  getLatestDownload () {
    return new Promise((resolve, reject) => {
      this.getConfigDatabase().then(db =>
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
      this.getConfigDatabase().then(db =>
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
      this.getConfigDatabase().then((db) => {
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
