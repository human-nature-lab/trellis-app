import DatabaseService from '../database'

class UploadServiceCordova {
  async removeUploads () {
    const conn = await DatabaseService.getDatabase()
    return conn.query('delete from updated_records')
  }
}

export default new UploadServiceCordova()
