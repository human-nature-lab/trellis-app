import {switchByModeEnv} from '../util'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

export const DatabaseService = switchByModeEnv({
  WEB: DatabaseServiceMock,
  CORDOVA: DatabaseServiceCordova
})

const dbDefault = new DatabaseService()
export default dbDefault

window.q = async function (query, parameters) {
  try {
    return await (await dbDefault.getDatabase()).query(query, parameters)
  } catch (err) {
    console.dir(err)
  }
}

window.ql = async function (query, parameters) {
  let r = await window.q(query, parameters)
  console.log(r)
  return r
}

window.dbDefault = dbDefault
