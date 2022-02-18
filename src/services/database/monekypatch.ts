// Stolen from https://gist.github.com/keenondrums/556f8c61d752eff730841170cd2bc3f1
import { Mutex, MutexInterface } from 'async-mutex'
import { Connection, ConnectionManager, ConnectionOptions, EntityManager, QueryRunner } from 'typeorm'
import { Driver } from 'typeorm/driver/Driver'
import { DriverFactory } from 'typeorm/driver/DriverFactory'
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError'
import { QueryRunnerProviderAlreadyReleasedError } from 'typeorm/error/QueryRunnerProviderAlreadyReleasedError'
import { CordovaDriver } from 'typeorm/driver/cordova/CordovaDriver'
import { CordovaQueryRunner } from 'typeorm/driver/cordova/CordovaQueryRunner'
// TODO: Fix me ASAP. Submit a PR to typeorm implemeting proper transaction handling for sqlite

const mutex = new Mutex()

class CordovaQueryRunnerPatched extends CordovaQueryRunner {
  private _releaseMutex: MutexInterface.Releaser | null

  async startTransaction (): Promise<void> {
    console.debug('monekypatch CordovaQueryRunnerPatched.startTransaction')
    this._releaseMutex = await mutex.acquire()
    console.debug('monekypatch CordovaQueryRunnerPatched.startTransaction -> acquired mutex')
    return super.startTransaction()
  }

  async commitTransaction (): Promise<void> {
    console.debug('monekypatch CordovaQueryRunnerPatched.commitTransaction')
    if (!this._releaseMutex) {
      throw new Error('monekypatch CordovaQueryRunnerPatched.commitTransaction -> mutex releaser unknown')
    }
    await super.commitTransaction()
    this._releaseMutex()
    this._releaseMutex = null
    console.debug('monekypatch CordovaQueryRunnerPatched.commitTransaction -> released mutex')
  }

  async rollbackTransaction (): Promise<void> {
    console.debug('monekypatch CordovaQueryRunnerPatched.rollbackTransaction')
    if (!this._releaseMutex) {
      throw new Error('CordovaQueryRunnerPatched.rollbackTransaction -> mutex releaser unknown')
    }
    await super.rollbackTransaction()
    this._releaseMutex()
    this._releaseMutex = null
    console.debug('CordovaQueryRunnerPatched.rollbackTransaction -> released mutex')
  }

  async connect (): Promise<any> {
    console.debug('monekypatch CordovaQueryRunnerPatched.connect')
    if (!this.isTransactionActive) {
      console.debug('monekypatch CordovaQueryRunnerPatched.connect -> wait for a lock to be released')
      const release = await mutex.acquire()
      release()
      console.debug('monekypatch CordovaQueryRunnerPatched.connect -> lock is released')
    }
    return super.connect()
  }
}

// class SqliteDriverPatched extends SqliteDriver {
//   createQueryRunner (mode: 'master' | 'slave' = 'master'): QueryRunner {
//     if (mode === 'slave') {
//       return new SqliteQueryRunnerPatched(this)
//     }
//     if (!this.queryRunner) {
//       this.queryRunner = new SqliteQueryRunnerPatched(this)
//     }
//     return this.queryRunner
//   }
// }

class CordovaDriverPatched extends CordovaDriver {
  createQueryRunner (mode: 'master' | 'slave' = 'master'): QueryRunner {
    if (mode === 'slave') {
      return new CordovaQueryRunnerPatched(this)
    }
    if (!this.queryRunner) {
      this.queryRunner = new CordovaQueryRunnerPatched(this)
    }
    return this.queryRunner
  }
}

class DriverFactoryPatched extends DriverFactory {
  create (connection: Connection): Driver {
    console.log('monekypatch DriverFactory.create', connection)
    const type = connection.options.type
    if (type === 'cordova' ) {
      return new CordovaDriverPatched(connection)
    }
    return super.create(connection)
  }
}

class ConnectionPatched extends Connection {
  constructor (connectionOptions: ConnectionOptions) {
    super(connectionOptions)
    const that = this as any
    that.driver = new DriverFactoryPatched().create(this)
  }
}

export const monekypatch = () => {
  ConnectionManager.prototype.create = function (options: ConnectionOptions): Connection {
    const that = this as any
    console.log('monekypatch ConnectionManager.create', options)
    const existConnection = that.connections.find((conn: any) => conn.name === (options.name || 'default'))
    if (existConnection) {
      // if connection is registered and its not closed then throw an error
      if (existConnection.isConnected) {
        throw new AlreadyHasActiveConnectionError(options.name || 'default')
      }

      // if its registered but closed then simply remove it from the manager
      that.connections.splice(that.connections.indexOf(existConnection), 1)
    }

    // create a new connection
    const connection = new ConnectionPatched(options)
    that.connections.push(connection)
    return connection
  }

  EntityManager.prototype.transaction = async function <T> (
    runInTransaction: (entityManger: EntityManager) => Promise<T>
  ): Promise<T> {
    if (this.queryRunner && this.queryRunner.isReleased) {
      throw new QueryRunnerProviderAlreadyReleasedError()
    }

    if (this.queryRunner && this.queryRunner.isTransactionActive) {
      throw new Error(`Cannot start transaction because its already started`)
    }

    const queryRunner = this.connection.createQueryRunner('slave')

    try {
      await queryRunner.startTransaction()
      const result = await runInTransaction(queryRunner.manager)
      await queryRunner.commitTransaction()
      return result
    } catch (err) {
      try { // we throw original error even if rollback thrown an error
        await queryRunner.rollbackTransaction()
        // tslint: disable-next-line
      } catch (rollbackError) {
        // tslint: disable-next-line
      }
      throw err
    } finally {
      await queryRunner.release()
    }
  }
}
