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

  async importFormTranslations (studyId: string, file: File, formId?: string) {
    const uri = uriTemplate('study/{study}/form-translation-import', [studyId])
    const formData = new FormData()
    formData.append('file', file)
    const res = await adminInst.post(uri, formData, {
      params: { formId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res
  }

}

export default new TransformService()
