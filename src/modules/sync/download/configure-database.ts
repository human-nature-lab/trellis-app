import { i18n } from '@/i18n'
import DatabaseService from '@/services/database'
import { Controller } from '..'

export async function configureDatabase<T> (data: T, ctrl: Controller) {
  const status = { message: i18n.t('configuring_db') }
  await DatabaseService.createDatabase()
  const queryRunner = (await DatabaseService.getDatabase()).createQueryRunner()
  await DatabaseService.createUpdatedRecordsTable(queryRunner, status)
  await DatabaseService.addTriggers(queryRunner, status)
  return data
}
