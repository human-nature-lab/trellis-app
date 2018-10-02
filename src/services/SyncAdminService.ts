import http from './http/AxiosInstance'

class SyncAdminService {

  async listUploads () {
    const res = await http().get(`list-uploads`)
    return res.data.uploads
  }

  async listSnapshots () {
    const res = await http().get(`list-snapshots`)
    return res.data.snapshots
  }

  async processUploads () {
    return http().post(`process-uploads`)
  }

  async generateSnapshot () {
    return http().post(`generate-snapshot`)
  }

}

export default new SyncAdminService()
