
export default class DatabaseServiceMock {
  constructor (public isReady = false) {}


  async getDatabase () {}

  async getConfigDatabase () {}

  async removeDatabase () {}

  async importDatabase (extractedSnapshot, trackProgress) {}

  async getLatestDownload () {}

  async getUpdatedRecordsCount () {}
}
