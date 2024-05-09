import { IntervalPoller } from '@/lib/interval-poller'

class MediaCapture {
  private readyPoller = new IntervalPoller(
    () => !!navigator && !!navigator.device && !!navigator.device.capture,
    100,
    30 * 1000,
  )

  async supportedAudioModes () {
    await this.readyPoller.wait()
    return navigator.device.capture.supportedAudioModes
  }

  async supportedImageModes () {
    await this.readyPoller.wait()
    return navigator.device.capture.supportedImageModes
  }

  async supportedVideoModes () {
    await this.readyPoller.wait()
    return navigator.device.capture.supportedVideoModes
  }

  async captureAudio (opts?: AudioOptions): Promise<MediaFile[]> {
    await this.readyPoller.wait()
    console.log('ready to capture audio')
    return new Promise((resolve, reject) => {
      navigator.device.capture.captureAudio(
        resolve,
        reject,
        opts,
      )
    })
  }

  async captureImage (opts?: ImageOptions): Promise<MediaFile[]> {
    await this.readyPoller.wait()
    console.log('ready to capture image')
    return new Promise((resolve, reject) => {
      navigator.device.capture.captureImage(
        resolve,
        reject,
        opts,
      )
    })
  }

  async captureVideo (opts?: VideoOptions): Promise<MediaFile[]> {
    await this.readyPoller.wait()
    console.log('ready to capture video')
    return new Promise((resolve, reject) => {
      navigator.device.capture.captureVideo(
        resolve,
        reject,
        opts,
      )
    })
  }
}

export default new MediaCapture()
