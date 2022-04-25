import Log from '../../entities/trellis-config/Log'
import DatabaseService from '../database'
import { Connection } from 'typeorm'

export default async function DeleteLogs () {
  const conn: Connection = await DatabaseService.getConfigDatabase()
  return conn.createQueryBuilder()
    .delete()
    .from(Log)
    .execute()
}
