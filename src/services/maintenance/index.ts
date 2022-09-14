import { ExpiringValue } from '../../classes/ExpiringValue'
import { parseDate } from '../DateService'
import { adminInst } from '../http/AxiosInstance'

export type MaintenanceData = {
  active: boolean
  key?: string
  began?: Date
  duration?: number
}

class MaintenanceService {
  private cache? = new ExpiringValue<MaintenanceData>(60 * 1000)
  async getStatus (): Promise<MaintenanceData> {
    const existing = this.cache.get()
    if (existing) {
      return existing
    }
    const res = await adminInst.get('/maintenance')
    const data: MaintenanceData = { active: res.data.active }
    if (data.active) {
      data.key = res.data.key
      data.began = parseDate(res.data.began)
      data.duration = res.data.duration
    }
    this.cache.set(data)
    return data
  }
}

export default new MaintenanceService()
