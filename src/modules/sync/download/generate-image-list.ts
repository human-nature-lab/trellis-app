import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { Step, Controller } from '..'
import { i18n } from '@/i18n'

export class GenerateImageList implements Step<any, void> {
  public name = 'Generate Image List'

  async run (_: any, ctrl: Controller, log: typeof console) {
    throw new Error('TODO')
  }
}
