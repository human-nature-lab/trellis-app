export class camera {
  static getPicture (opts?: CameraOptions) {
    return new Promise((resolve, reject) => {
      if (!navigator || !navigator.camera) {
        return reject(new Error('Camera API not found'))
      }
      navigator.camera.getPicture(resolve, reject, opts)
    })
  }

  static cleanup () {
    return new Promise<void>((resolve, reject) => {
      navigator.camera.cleanup(resolve, reject)
    })
  }
}
