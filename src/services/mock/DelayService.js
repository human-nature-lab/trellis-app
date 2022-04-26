import config from '../../config'
export default class GeneratorService {
  delayPromise () {
    return new Promise(function (resolve) {
      let delay = 0
      if (config.hasOwnProperty('delayMockServices') && config.delayMockServices) {
        delay = 400 + (Math.random() * 200)
      }
      setTimeout(function () {
        resolve()
      }, delay)
    })
  }
}
