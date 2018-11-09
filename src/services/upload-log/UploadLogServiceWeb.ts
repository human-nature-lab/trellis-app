import UploadLog from "../../entities/web/UploadLog";
import http from '../http/AxiosInstance'

export default class UploadLogServiceWeb {
  async getLogs (uploadId: string): Promise<UploadLog[]> {
    const res = await http().get(`upload-log/${uploadId}`)
    return res.data.map(o => new UploadLog().fromSnakeJSON(o))
  }
}
