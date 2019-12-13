import { switchByModeEnv } from '../util'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'
import config from 'config'

export const DatabaseService = switchByModeEnv({
  WEB: DatabaseServiceMock,
  CORDOVA: DatabaseServiceCordova
})

const dbDefault = new DatabaseService()
export default dbDefault

// Add methods for running queries directly on the tablet
if (config.debug) {
  const runQuery = async function (query: string, parameters?: string[], db?: string) {
    db = db || 'trellis'
    try {
      return (await (db === 'trellis' ? dbDefault.getDatabase() : dbDefault.getConfigDatabase())).query(query, parameters)
    } catch (err) {
      console.dir(err)
    }
  }
  // @ts-ignore
  window.q = runQuery
  // @ts-ignore
  window.ql = async function (query, parameters, db) {
    let r = await runQuery(query, parameters, db)
    console.log(r)
    return r
  }
  // @ts-ignore
  window.c = async function (query, parameters, db) {
    let r = await runQuery(query, parameters, db)
    for (let row of r) {
      // console.log(JSON.stringify(row))
      console.log(row)
    }
    console.log(`${r.length} rows`)
    return r
  }
  // @ts-ignore
  window.dbDefault = dbDefault
}

