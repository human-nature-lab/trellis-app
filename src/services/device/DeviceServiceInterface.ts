import Pagination from "../../types/Pagination";
import Device from '../../entities/trellis/Device'

export default interface DeviceServiceInterface {
  /**
   * Get the unique id for this device
   */
  getUUID (): PromiseLike<string>

  /**
   * Get available disk space on this device
   */
  getFreeDiskSpace (): PromiseLike<number>

  /**
   * Check if the cordova device plugin is ready
   */
  isDeviceReady (): PromiseLike<boolean>

  /**
   * Get a list of all devices on the server
   * @param pagination
   */
  getDevices (pagination: Pagination<Device>): PromiseLike<Pagination<Device>>

  /**
   * Delete a single device
   * @param deviceId
   */
  deleteDevice (deviceId: string): PromiseLike<any>

  /**
   * Update a single device model
   * @param device
   */
  updateDevice (device: Device): PromiseLike<Device>

  /**
   * Create a new device
   * @param device
   */
  createDevice (device: Device): PromiseLike<Device>
}
