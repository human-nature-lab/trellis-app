import UploadLog from '../../entities/web/UploadLog'
import { adminInst } from '../http/AxiosInstance'

export default class UploadServiceWeb {
  async getLogs (uploadId: string): Promise<UploadLog[]> {
    const res = await adminInst.get(`upload-log/${uploadId}`)
    if (res.status !== 200) throw new Error('Unable to find logs for this upload')
    return res.data.map(o => new UploadLog().fromSnakeJSON(o))
  }
}
