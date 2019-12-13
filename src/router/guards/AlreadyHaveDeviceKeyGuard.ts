import DeviceKeyGuard from './DeviceKeyGuard'

export default {
  name: 'AlreadyHaveDeviceKeyGuard',
  async condition () {
    return !(await DeviceKeyGuard.condition())
  }
}
