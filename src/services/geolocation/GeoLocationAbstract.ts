export default abstract class GeoLocationAbstract {

  private options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10
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
