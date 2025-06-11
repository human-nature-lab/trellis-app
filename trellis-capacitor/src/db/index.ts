import 'reflect-metadata'
import { DataSource, type DataSourceOptions } from 'typeorm'
import { asyncSingleton } from '@/lib/async-singleton'
import sqliteParams from './sqliteParams'
import * as entities from './entities/trellis'
import * as configEntities from './entities/config'

const trellisDbName = 'trellis'
const configDbName = 'trellis-config'

const trellisConfig: DataSourceOptions = {
  name: 'trellisConnection',
  type: 'capacitor',
  driver: sqliteParams.connection,
  database: trellisDbName,
  mode: 'no-encryption',
  entities: entities,
  // migrations: migrations, //["../migrations/author/*{.ts,.js}"]
  subscribers: [],
  logging: ['query', 'error', 'schema'],
  synchronize: true,
  migrationsRun: false,
}

const trellisConfigDbConfig: DataSourceOptions = {
  name: 'trellisConfigConnection',
  type: 'capacitor',
  driver: sqliteParams.connection,
  database: configDbName,
  mode: 'no-encryption',
  entities: configEntities,
  // migrations: migrations, //["../migrations/author/*{.ts,.js}"]
  subscribers: [],
  logging: ['query', 'error', 'schema'],
  synchronize: true,
  migrationsRun: false,
}

export const trellisDataSource = {
  dataSource: new DataSource(trellisConfig),
  dbName: trellisDbName,
}

export const trellisConfigDataSource = {
  dataSource: new DataSource(trellisConfigDbConfig),
  dbName: configDbName,
}

export const getTrellisConnection = asyncSingleton(async () => {
  await sqliteParams.connection.checkConnectionsConsistency()
  await trellisDataSource.dataSource.initialize()
  if (!trellisDataSource.dataSource.isInitialized) {
    throw new Error('Database initialization failed')
  }
  return trellisDataSource.dataSource
})

export const getTrellisConfigConnection = asyncSingleton(async () => {
  await sqliteParams.connection.checkConnectionsConsistency()
  await trellisConfigDataSource.dataSource.initialize()
  if (!trellisConfigDataSource.dataSource.isInitialized) {
    throw new Error('Database initialization failed')
  }
  return trellisConfigDataSource.dataSource
})