import Config from '../../entities/trellis/Config'
import { adminInst } from '../http/AxiosInstance'
import ConfigServiceAbstract from './ConfigServiceAbstract'

export class ConfigServiceWeb extends ConfigServiceAbstract {

  protected async getAll (): Promise<Config[]> {
    const res = await adminInst.get('config')
    return res.data.map(c => new Config().fromSnakeJSON(c))
  }

  protected async setRemote (key: string, value: any): Promise<Config> {
    const res = await adminInst.put('config', { key, value })
    return new Config().fromSnakeJSON(res.data)
  }

  protected async resetRemote (key: string): Promise<Config> {
    const res = await adminInst.delete('config', {
      data: { key }
    })
    return new Config().fromSnakeJSON(res.data)
  }

}
