import Config from '../../entities/trellis/Config'
import { adminInst } from '../http/AxiosInstance'
import ConfigServiceAbstract from './ConfigServiceAbstract'

export default class ConfigServiceWeb extends ConfigServiceAbstract {

  public async getAll (): Promise<Config[]> {
    const res = await adminInst.get('config')
    return res.data.map(c => new Config().fromSnakeJSON(c))
  }

  public async set (key: string, value: any): Promise<void> {
    await adminInst.put('config', { key, value })
  }

  public async reset (key: string): Promise<Config> {
    const res = await adminInst.delete('config', {
      data: { key }
    })
    return new Config().fromSnakeJSON(res.data)
  }

}
