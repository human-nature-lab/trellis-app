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
      /* Hack for Dev
      resolve({
        coords: {
          latitude: 0,
          longitude: 0,
          altitude: 0,
          accuracy: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0,
        },
        timestamp: 0
      })
      */
    })
    return position as Position
  }
}
