import { insomnia } from '@/cordova/insomnia'
import { i18n } from '@/i18n'
import { authenticateDevice, checkConnection, compareTime } from './common'
import { VueController } from './controller'
import { checkDiskSpace, downloadImages, missingImages } from './images'

export function runImageDownload (ctrl: VueController) {
  const g1 = ctrl.addGroup(i18n.t('connecting'))
  const g2 = ctrl.addGroup(i18n.t('images'))

  const g1s1 = ctrl.addStep(g1, i18n.t('checking_connection'))
  const g1s2 = ctrl.addStep(g1, i18n.t('device_authenticating'))
  const g1s3 = ctrl.addStep(g1, i18n.t('comparing_server_time'))

  const g2s1 = ctrl.addStep(g2, i18n.t('requesting_image_list'))
  const g2s2 = ctrl.addStep(g2, i18n.t('checking_space'))
  const g2s3 = ctrl.addStep(g2, i18n.t('downloading_images'))
  return async function () {
    ctrl.setGroup(g1)
    ctrl.setStep(g1s1)
    await checkConnection(ctrl)
    ctrl.setStep(g1s2)
    await authenticateDevice(ctrl)
    ctrl.setStep(g1s3)
    // await compareTime()

    ctrl.setGroup(g2)
    try {
      await insomnia.keepAwake()
      ctrl.setStep(g2s1)
      const images = await missingImages()
      ctrl.setStep(g2s2)
      await checkDiskSpace(ctrl, images)
      ctrl.setStep(g2s3)
      await downloadImages(ctrl, images)
      ctrl.done()
    } finally {
      await insomnia.allowSleep()
    }
  }
}
