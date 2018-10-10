import http from '../http/AxiosInstance'
import ConditionTagInterface from './ConditionTagInterface'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'
export class ConditionTagWeb implements ConditionTagInterface {

  createConditionTag (name) {
    return http().post(`condition-tag`, {
      name
    }).then(res => new ConditionTag().fromSnakeJSON(res.data.condition_tag))
  }

  createRespondentConditionTag (respondentId, conditionTagId) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    return http().post(`respondent/${respondentId}/condition-tag/${conditionTagId}`)
      .then(res => new RespondentConditionTag().fromSnakeJSON(res.data.condition_tag))
  }

  removeRespondentConditionTag (respondentId, conditionTagId) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    return http().delete(`respondent/${respondentId}/condition-tag/${conditionTagId}`)
      .then(res => res.data)
  }

  async respondent (): Promise<ConditionTag[]> {
    const res = await http().get('/condition-tags/respondent')
    return res.data.conditions.map(c => new ConditionTag().fromSnakeJSON(c))
  }

  all () {
    return http().get('/condition-tags')
      .then(res => res.data.condition_tags.map(c => new ConditionTag().fromSnakeJSON(c)))
  }
}

export default new ConditionTagWeb()
