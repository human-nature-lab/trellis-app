/* global md5chksum */

import { FSFileEntry } from './file'

export class md5 {
  static hash (entry: FSFileEntry | { toURL(): string }): Promise<string> {
    if (!md5chksum) {
      throw new Error('md5chksum is not available. make sure "cordova-plugin-file-md5" is installed')
    }
    const e = {
      toURL () {
        return entry.toURL()
      },
    }
    if ('nativeURL' in entry) {
      e.toURL = () => entry.nativeURL
    }
    return new Promise((resolve, reject) => {
      md5chksum.file(e, resolve, reject)
    })
  }
}
