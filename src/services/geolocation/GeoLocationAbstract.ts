import {defaultLoggingService as logger} from "../logging/LoggingService";
import {LoggingLevel} from "../logging/LoggingTypes";
import global from '../../static/singleton'
import config from 'config'

export default abstract class GeoLocationAbstract {

  protected options = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 5 * 60 * 1000 // 1/2 hour
  }

  protected watchId: string|number = null
  public positionHistory: Position[] = []

  /**
   * Start watching the position globally. As far as this service is aware, this should be the only global watch
   * on the position. This watch stores a history of the most recent 200 positions in memory.
   */
  public watchPosition () {
    console.log('Starting watch')
    if (config.debug) {
      setTimeout(() => {
        global.gpsFixed = true
      }, 3000)
    }
    const component = 'GeoLocationAbstract.ts@watchPosition'
    if (this.watchId !== null) {
      logger.log({
        severity: LoggingLevel.error,
        component,
        message: `Can't start watching when a watch is already active`
      })
      // Prevent overlapping
      this.clearWatch()
    }
    try {
      this.watchId = navigator.geolocation.watchPosition(this.onPosition.bind(this), err => {
        // @ts-ignore
        err.component = component
        logger.log(err)
      }, this.options)
    } catch (err) {
      err.component = component
      global.gpsFixed = false
      logger.log(err)
    }
  }

  /**
   * Clear the global position watch
   */
  public clearWatch () {
    console.log('Clearing watch')
    global.gpsFixed = false
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId as number)
      this.watchId = null
    }
  }

  private onPosition (pos: Position) {
    console.log(pos, this.positionHistory.length)
    this.storePosition(pos)
  }

  /**
   * First trys to grab the latest position received. If it isn't recent enough, the getCurrentPosition method is
   * tried. It returns the same errors as the getCurrentPosition method.
   * @param {number} tolerance
   * @returns {Promise<Position>}
   */
  public async getLocationTolerance (tolerance: number): Promise<Position> {
    const now = Date.now()
    const latestPos = this.positionHistory.length && this.positionHistory[this.positionHistory.length - 1]
    if (latestPos && now - latestPos.timestamp <= tolerance) {
      logger.log({
        component: 'GeoLocationAbstract.ts@getLocationTolerance',
        message: 'Latest location within tolerance of ' + tolerance,
        severity: LoggingLevel.debug
      })
      return latestPos
    } else {
      logger.log({
        component: 'GeoLocationAbstract.ts@getLocationTolerance',
        message: `Couldn't get latest location, trying to get currentPosition`,
        severity: LoggingLevel.debug
      })
      return this.getCurrentPosition()
    }
  }

  public async getLatestPosition (): Promise<Position> {
    return this.positionHistory[this.positionHistory.length - 1]
  }

  public async hasPositionHistory (): Promise<boolean> {
    return this.positionHistory.length > 0
  }

  private storePosition (pos: Position): void {
    this.positionHistory.push(pos)
    if (this.positionHistory.length > 10) {
      this.positionHistory.shift()
    }
    global.gpsFixed = true
  }

  /**
   * Returns the current position using the geolocation.getCurrentLocation API.
   * @returns {Promise<Position>}
   */
  getCurrentPosition (): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (config.debug && Math.random() > .5) {
        return resolve({
          timestamp: 400,
          coords: {
            latitude: 1000,
            longitude: 1000,
            altitude: -1000000,
            accuracy: 1000000000000
          } as Coordinates
        })
      }
      try {
        navigator.geolocation.getCurrentPosition(position => {
          this.storePosition(position)
          resolve(position)
        }, err => {
          global.gpsFixed = false
          reject(err)
        }, this.options)
      } catch (err) {
        global.gpsFixed = false
        reject(err)
      }
    })
  }
}
