import {switchByModeEnv} from '../util'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

export const DatabaseService = switchByModeEnv({
  WEB: DatabaseServiceMock,
  CORDOVA: DatabaseServiceCordova
})

const dbDefault = new DatabaseService()
export default dbDefault

window.q = async function (query, parameters, db) {
  db = db || 'trellis'
  try {
    return await (await (db === 'trellis' ? dbDefault.getDatabase() : dbDefault.getConfigDatabase())).query(query, parameters)
  } catch (err) {
    console.dir(err)
  }
}

window.ql = async function (query, parameters, db) {
  let r = await window.q(query, parameters, db)
  console.log(r)
  return r
}

window.c = async function (query, parameters, db) {
  let r = await window.q(query, parameters, db)
  for (let row of r) {
    // console.log(JSON.stringify(row))
    console.log(row)
  }
  console.log(`${r.length} rows`)
  return r
}

window.dbDefault = dbDefault
