import DatabaseService from '@/services/database'

export async function closeDatabase<T> (data: T) {
  await DatabaseService.closeDatabase()
  return data
}
