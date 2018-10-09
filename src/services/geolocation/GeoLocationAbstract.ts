export default abstract class GeoLocationAbstract {

  private options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30 * 60 * 1000 // 1/2 hour
  }

  async getCurrentPosition () {
    return await new Promise((resolve, reject) => {
      try {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position)
        }, err => {
          reject(err)
        }, this.options)
      } catch (err) {
        reject(err)
      }
    })
  }
}
