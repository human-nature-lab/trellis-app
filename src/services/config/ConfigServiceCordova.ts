import Config from '../../entities/trellis/Config'
import ConfigServiceAbstract from './ConfigServiceAbstract'
import DatabaseService from '../database/DatabaseService'

export class ConfigServiceCordova extends ConfigServiceAbstract {
  protected async getAll (): Promise<Config[]> {
    try {
      const repo = await DatabaseService.getRepository(Config)
      return repo.find()
    } catch (err) {
      return []
    }
  }

  protected async setRemote (key: string, value: string): Promise<Config> {
    throw Error('Not implemented')
  }

  protected async resetRemote (key: string): Promise<Config> {
    throw Error('Not implemented')
  }
}
