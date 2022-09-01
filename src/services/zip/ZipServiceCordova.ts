/* global zip */
/* global Zeep */
import FileService from '../file'

class ZipServiceCordova {
  unzipFile (fileEntry: FileEntry, progressCallback: () => any) {
    return new Promise((resolve, reject) => {
      FileService.requestFileSystem()
        .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
        .then((directoryEntry) => {
          const dirUrl = directoryEntry.toURL()
          const fileUrl = fileEntry.toURL()
          // @ts-ignore
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

  zipFile (fromDirectoryEntry: DirectoryEntry, toDirectoryEntry: DirectoryEntry, toFileName: string): Promise<void> {
    const fromUrl = fromDirectoryEntry.toURL()
    const toUrl = toDirectoryEntry.toURL() + '/' + toFileName
    return this.zip(fromUrl, toUrl)
  }

  zip (fromURL: string, toURL: string) {
    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      Zeep.zip({ from: fromURL, to: toURL },
        function () {
          console.log('zipFile done')
          resolve()
        }, function (err) {
          console.error(err)
          reject(err)
        })
    })
  }
}

export default ZipServiceCordova
