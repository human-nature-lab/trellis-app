import Skip from "../../entities/trellis/Skip";
import {adminInst} from "../http/AxiosInstance";
import {safeUrl} from "../http/WebUtils";
import FormSkip from "../../entities/trellis/FormSkip";

class SkipService {

  /**
   * Create a skip on a form
   * @param formId
   * @param skip
   */
  async createFormSkip (formId: string, skip: Skip): Promise<FormSkip> {
    const res = await adminInst.post(safeUrl('form/{}/skip', [formId]), skip.toSnakeJSON({
      includeRelationships: true
    }))
    return new FormSkip().fromSnakeJSON(res.data.form_skip)
  }

  /**
   * Delete a form skip.
   * @param formId
   * @param skipId
   */
  async deleteFormSkip (formId: string, skipId: string): Promise<any> {
    return adminInst.delete(safeUrl('form/{form}/skip/{skip}', [formId, skipId]))
  }

  /**
   * Update a skip
   * @param skip
   */
  async updateSkip (skip: Skip): Promise<Skip> {
    const res = await adminInst.put(safeUrl('skip/{}', [skip.id]), skip.toSnakeJSON({
      includeRelationships: true
    }))
    return new Skip().fromSnakeJSON(res.data.skip)
  }

}

export default new SkipService()
