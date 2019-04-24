import Config from '../../entities/trellis/Config'
import config from 'config'
import { getDot, setDot } from '../JSONUtil'

export default abstract class ConfigServiceAbstract {

  async load (): Promise<void> {

    const pairs: Config[] = await this.getAll()

    for (const pair of pairs) {
      console.log('get before', pair.key, getDot(config, pair.key))
      let val: any = pair.value
      switch (pair.type) {
        case 'boolean':
          val = !!+val
          break
        case 'integer':
          val = parseInt(val, 10)
          break
        case 'float':
          val = parseFloat(val)
          break
      }

      setDot(config, pair.key, val)

      console.log('get after', pair.key, getDot(config, pair.key))
    }

  }

  public abstract getAll (): PromiseLike<Config[]>

  public abstract set (key: string, value: any): PromiseLike<any>

  public abstract reset (key: string): PromiseLike<Config>

}
