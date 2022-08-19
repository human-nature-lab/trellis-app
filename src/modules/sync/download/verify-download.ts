import FileService from '@/services/file'
import { Controller } from '..'
import { i18n } from '@/i18n'
import Snapshot from '@/entities/trellis/Snapshot'

export async function verifyDownload (data: { fileEntry: FileEntry, snapshot: Snapshot }, ctrl: Controller) {
  const md5Hash = await FileService.calculateMD5Hash(data.fileEntry)
  if (md5Hash !== data.snapshot.hash) {
    ctrl.log.error('hashes dont match', data.snapshot.hash, md5Hash)
    throw new Error(i18n.t('hash_dont_match').toString())
  }
  return data
}
