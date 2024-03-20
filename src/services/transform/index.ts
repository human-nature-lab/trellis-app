import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

export class TransformService {
  async getFormTranslations (formIds: string[], studyId: string) {
    const res = await adminInst.get(uriTemplate('study/{study}/form-translation-export', [studyId]), {
      responseType: 'blob',
      params: {
        ids: formIds,
      },
    })
    return res.data
  }
}

export default new TransformService()
