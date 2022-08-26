export class insomnia {
  static keepAwake () {
    if (window.plugins && window.plugins.insomnia) {
      console.log('insomnia.keepAwake')
      return new Promise((resolve, reject) => {
        window.plugins.insomnia.keepAwake(resolve, reject)
      })
    }
  }

  static async allowSleep () {
    if (window.plugins && window.plugins.insomnia) {
      console.log('insomnia.allowSleep')
      return new Promise((resolve, reject) => {
        window.plugins.insomnia.allowSleepAgain(resolve, reject)
      })
    }
  }
}
