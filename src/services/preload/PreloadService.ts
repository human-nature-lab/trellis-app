import PreloadAction from '../../entities/trellis/PreloadAction'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

class PreloadService {
  async importPreloadActions (studyId: string, file: File): Promise<PreloadAction[]> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await adminInst.post(uriTemplate('/study/{study}/preload-actions', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data.map(a => new PreloadAction().fromSnakeJSON(a))
  }
}

export default new PreloadService()