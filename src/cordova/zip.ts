import { file, FSDirectoryEntry, FSFileEntry } from './file'

type FileDescriptor = FSFileEntry | FileEntry | string
type DirectoryDescriptor = FSDirectoryEntry | DirectoryEntry | string

function resolvePath (desc: FileDescriptor | DirectoryDescriptor) {
  if (typeof desc === 'string') {
    return desc
  }
  return desc.nativeURL || desc.toURL()
}

type ProgressEvent = { loaded: number, total: number }

export class zipper {
  static unzip (source: FileDescriptor, destDir: DirectoryDescriptor, progress?: (event: ProgressEvent) => void) {
    if (!zip) {
      throw new Error('zip plugin not available. Make sure "cordova-plugin-zip" is installed')
    }
    return new Promise<FSFileEntry>((resolve, reject) => {
      const dirUrl = resolvePath(destDir)
      const fileUrl = resolvePath(source)
      zip.unzip(fileUrl, dirUrl, async result => {
        console.log('unzip result', result)
        if (result === -1) {
          reject(result)
        }
        const dirEntry = await file.resolveDirectoryUri(dirUrl)
        const entries = await dirEntry.files()
        for (const entry of entries) {
          console.log('entry', entry.name)
          if (entry.name.slice(-4) !== '.zip') {
            resolve(entry)
          }
        }
      }, progress)
    })
  }
}
