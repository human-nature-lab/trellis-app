import FileService from '@/services/file'

export async function moveDatabase<T> (data: T) {
  const dbUrl = cordova.file.applicationStorageDirectory + 'databases/trellis'
  const snapshotUrl = cordova.file.applicationStorageDirectory + 'files/files/snapshots/snapshot.db'
  console.log(dbUrl, snapshotUrl)
  await FileService.moveUrl(snapshotUrl, dbUrl)
  return data
}
