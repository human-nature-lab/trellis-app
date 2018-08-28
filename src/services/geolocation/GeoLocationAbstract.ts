export default abstract class GeoLocationAbstract {

  private options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10
  }

  async getCurrentPosition () {
    let position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        resolve(position)
      }, err => {
        reject(err)
      }, this.options)
    })
    return position as Position
  }
}
