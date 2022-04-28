import Config from '../../entities/trellis/Config'
import config from '../../config'
import { safeParse, setDot } from '../JSONUtil'

export default abstract class ConfigServiceAbstract {

  /**
   * Load all of the visible configuration values. Some are private and will only be shown if the user is logged in.
   */
  public async load (): Promise<void> {
    try {
      const pairs: Config[] = await this.getAll()
      for (const pair of pairs) {
        const val = this.castValue(pair.type, pair.value)
        setDot(config, pair.key, val)
      }
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Convert the val to the correct data type
   * @param type
   * @param val
   */
  private castValue (type: string, val: any): any {
    switch (type) {
      case 'boolean':
        return !!+val
      case 'integer':
        return parseInt(val, 10)
      case 'float':
        return parseFloat(val)
      case 'object':
        return safeParse(val)
    }
    return val
  }

  /**
   * Set the value for a key. Sets the value remotely and then updates the local copy.
   * @param key
   * @param value
   */
  public async set (key: string, value: any): Promise<Config> {
    const pair = await this.setRemote(key, value)
    setDot(config, key, this.castValue(pair.type, pair.value))
    return pair
  }

  /**
   * Reset the value for a single key to the default value for that key.
   * @param key
   */
  public async reset (key: string): Promise<Config> {
    const pair = await this.resetRemote(key)
    const val = this.castValue(pair.type, pair.value)
    setDot(config, key, val)
    return pair
  }

  protected abstract getAll (): PromiseLike<Config[]>

  protected abstract setRemote (key: string, value: any): PromiseLike<Config>

  protected abstract resetRemote (key: string): PromiseLike<Config>

}
