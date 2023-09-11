import { adminInst } from './http/AxiosInstance'

class SyncAdminService {
  async listUploads () {
    const res = await adminInst.get('list-uploads')
    return res.data.uploads
  }

  async listSnapshots () {
    const res = await adminInst.get('list-snapshots')
    return res.data.snapshots
  }

  async processUploads (uploads: string[]) {
    return adminInst.post('process-uploads', {
      uploads,
    })
  }

  async generateSnapshot (force = false) {
    return adminInst.post('generate-snapshot', {
      force,
    }, {
      timeout: 0,
    })
  }
}

export default new SyncAdminService()
