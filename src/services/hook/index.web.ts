import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

export class HookService {
  static async geoHooks (geoId: string) {
    const res = await adminInst.get(uriTemplate('/hooks/geo/{id}', [geoId]))
    return res.data
  }

  static async runGeoHook (geoId: string, hookId: string) {
    const res = await adminInst.post(uriTemplate('/hooks/geo/{geoid}/{hookid}', [geoId, hookId]))
    return res.data
  }
}
