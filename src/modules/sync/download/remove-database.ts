import FileService from '@/services/file'

export async function removeDatabase<T> (data: T) {
  const dbLoc = cordova.file.applicationStorageDirectory + 'databases/trellis'
  if (await FileService.existsUrl(dbLoc)) {
    await FileService.deleteUrl(dbLoc)
  }
  return data
}
