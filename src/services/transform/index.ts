import { DocService } from '../doc'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

export class TransformService {
  async downloadFormTranslations (formIds: string, studyId: string) {
    const res = await adminInst.get(uriTemplate('study/{study}/form-translation-export', [studyId]), {
      responseType: 'blob',
      params: {
        ids: formIds,
      },
    })
    return DocService.saveAs(res.data, 'trellis-translations.zip')
  }
}

export default new TransformService()
