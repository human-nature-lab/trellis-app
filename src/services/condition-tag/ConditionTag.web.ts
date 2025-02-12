import http, { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import ConditionTagInterface from './ConditionTagInterface'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'

export class ConditionTagService implements ConditionTagInterface {
  async createConditionTag (name) {
    const res = await http().post('condition-tag', { name })
    return new ConditionTag().fromSnakeJSON(res.data.condition_tag)
  }

  async getRespondentConditionTagNames (): Promise<string[]> {
    const res = await http().get('/condition-tag-names')
    return res.data.condition_tag_names
  }

  async createRespondentConditionTag (respondentId: string, conditionTagId: string) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    const res = await http().post(`respondent/${respondentId}/condition-tag/${conditionTagId}`)
    return new RespondentConditionTag().fromSnakeJSON(res.data.condition_tag)
  }

  async removeRespondentConditionTag (respondentId, conditionTagId) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    const res = await http().delete(`respondent/${respondentId}/condition-tag/${conditionTagId}`)
    return res.data
  }

  async respondent (): Promise<ConditionTag[]> {
    const res = await http().get('/condition-tags/respondent')
    return res.data.conditions.map(c => new ConditionTag().fromSnakeJSON(c))
  }

  async all () {
    const res = await http().get('/condition-tags')
    return res.data.condition_tags.map(c => new ConditionTag().fromSnakeJSON(c))
  }

  async assignTagViaGeos (conditionTagId: string, includeChildren: boolean, onlyUseCurrentGeo: boolean, geoIds: string[]) {
    const res = await adminInst.post(`respondent/assign-tag-via-geo/${conditionTagId}`, {
      includeChildren,
      onlyUseCurrentGeo,
      geoIds,
    })
    return res.data
  }

  async importRespondentConditionTags (file: File, studyId: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await adminInst.post(uriTemplate('study/{studyId}/respondent-tag/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}
