import Config from '../../entities/trellis/Config'
import ConfigServiceAbstract from './ConfigServiceAbstract'
import DatabaseService from '../database/DatabaseService'

export default class ConfigServiceCordova extends ConfigServiceAbstract {

  public async getAll (): Promise<Config[]> {
    try {
      const repo = await DatabaseService.getRepository(Config)
      return repo.find()
    } catch (err) {
      return []
    }
  }

  async set (key: string, value: string): Promise<void> {
    throw Error('Not implemented')
  }

  async reset (key: string): Promise<Config> {
    throw Error('Not implemented')
  }

}
