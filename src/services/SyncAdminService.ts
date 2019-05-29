import { adminInst } from './http/AxiosInstance'

class SyncAdminService {

  async listUploads () {
    const res = await adminInst.get(`list-uploads`)
    return res.data.uploads
  }

  async listSnapshots () {
    const res = await adminInst.get(`list-snapshots`)
    return res.data.snapshots
  }

  async processUploads () {
    return adminInst.post(`process-uploads`)
  }

  async generateSnapshot () {
    return adminInst.post(`generate-snapshot`)
  }

}

export default new SyncAdminService()
