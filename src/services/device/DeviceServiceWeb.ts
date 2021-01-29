import Pagination from '../../types/Pagination'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import DeviceServiceInterface from './DeviceServiceInterface'
import Device from '../../entities/trellis/Device'

export default class DeviceServiceWeb implements DeviceServiceInterface {
  async getUUID (): Promise<string> {
    return null
  }

  getFreeDiskSpace(): Promise<number> {
    throw new Error('No implemented')
  }

  async isDeviceReady(): Promise<boolean> {
    return true
  }

  async getDevices (pagination: Pagination<Device>): Promise<Pagination<Device>> {
    const res = await adminInst.get('device')
    const devices = res.data.devices.map(d => new Device().fromSnakeJSON(d))
    return {
      total: devices.length,
      start: 0,
      count: devices.length,
      data: devices
    } as Pagination<Device>
  }

  async deleteDevice (deviceId: string): Promise<void> {
    await adminInst.delete(uriTemplate('device/{device}', [deviceId]))
  }

  async updateDevice (device: Device): Promise<Device> {
    const res = await adminInst.put(uriTemplate('device/{device}', [device.id]), device.toSnakeJSON())
    return new Device().fromSnakeJSON(res.data.device)
  }

  async createDevice (device: Device): Promise<Device> {
    throw new Error('Not implemented')
  }

  async getDeviceKey (): Promise<string> {
    throw new Error('Not implemented')
  }

}
