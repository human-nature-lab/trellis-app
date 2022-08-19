import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { Step, Controller } from '..'
import { i18n } from '@/i18n'
import FileService from '@/services/file'

export async function emptySnapshotDirectory<T> (data: T) {
  const fileSystem = await FileService.requestFileSystem()
  const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'snapshots')
  await FileService.emptyDirectory(directoryEntry)
  return data
}
