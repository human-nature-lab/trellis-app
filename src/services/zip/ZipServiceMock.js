import JSZip from 'jszip'
import { DeviceService } from '@/services/device/DeviceService'
import { FileService } from '@/services/file/FileService'

class ZipServiceMock {

  unzipFile (fileEntry) {
    return new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          fileEntry.file((file) => {
            let reader = new FileReader()
            reader.onloadend = function () {
              let jsZip = new JSZip()
              jsZip.loadAsync(this.result)
                .then((zip) => {
                  zip.forEach((relativePath, zipObject) => {
                    zipObject.async('blob')
                      .then((blob) => {
                        FileService.writeFile('snapshots', blob, zipObject.name, blob.size)
                          .then((fileEntry) => {
                            resolve(fileEntry)
                          },
                          (error) => {
                            console.error(error)
                            reject(error)
                          })
                      })
                  })
                })
            }
            reader.readAsArrayBuffer(file)
          })
        })
    })
  }

}

export default ZipServiceMock
