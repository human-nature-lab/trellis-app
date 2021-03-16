/* global zip */
/* global Zeep */
import FileService from '../file/FileService'

class ZipServiceCordova {

  unzipFile (fileEntry: FileEntry, progressCallback: () => any) {
    return new Promise((resolve, reject) => {
      FileService.requestFileSystem()
        .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
        .then((directoryEntry) => {
          let dirUrl = directoryEntry.toURL()
          let fileUrl = fileEntry.toURL()
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
    console.log('zipFile')
    return new Promise((resolve, reject) => {
      let fromUrl = fromDirectoryEntry.toURL()
      let toUrl = toDirectoryEntry.toURL() + '/' + toFileName
      console.log('fromUrl', fromUrl)
      console.log('toUrl', toUrl)
      // @ts-ignore
      Zeep.zip({from: fromUrl, to: toUrl},
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
