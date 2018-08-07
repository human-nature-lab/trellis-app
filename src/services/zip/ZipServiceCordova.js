/* global zip */
import { FileService } from '@/services/file/FileService'

class ZipServiceCordova {

  unzipFile (fileEntry, progressCallback) {
    return new Promise((resolve, reject) => {
      FileService.requestFileSystem()
        .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
        .then((directoryEntry) => {
          let dirUrl = directoryEntry.toURL()
          let fileUrl = fileEntry.toURL()
          zip.unzip(fileUrl, dirUrl, function (result) {
            if (result === -1) {
              reject(new Error('Unable to extract the zip file.'))
            } else {
              directoryEntry
                .createReader()
                .readEntries((entries) => {
                  entries.forEach((entry) => {
                    // Ignore the .zip file
                    if (entry.name.slice(-4) !== '.zip') {
                      resolve(entry)
                    }
                  })
                  reject(new Error('No extracted file found.'))
                })
            }
          }, progressCallback)
        })
    })
  }

}

export default ZipServiceCordova
