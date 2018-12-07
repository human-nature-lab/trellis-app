import BarcodeServiceInterface from './BarcodeServiceInterface'
import merge from 'lodash/merge'

export default class BarcodeServiceCordova implements BarcodeServiceInterface {

  private scanner = cordova.plugins.barcodeScanner
  private options: phonegapBarcode.BarcodeScanOptions = {
    // See (docs)[https://github.com/phonegap/phonegap-plugin-barcodescanner#using-the-plugin] for more info
    disableAnimations: true
  }

  private isBarcodeAvailable (): boolean {
    return cordova && cordova.plugins && cordova.plugins.barcodeScanner
  }

  scan (options?: phonegapBarcode.BarcodeScanOptions): Promise<phonegapBarcode.BarcodeScanResult> {
    options = merge({}, this.options, options)
    return new Promise((resolve, reject) => {
      if (!this.isBarcodeAvailable()) return reject('Barcode scanner is not defined')
      this.scanner.scan((result: phonegapBarcode.BarcodeScanResult) => {
        resolve(result)
      }, err => {
        reject(err)
      }, options)
    })
  }

  encode (encodingType: phonegapBarcode.EncodingType, text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isBarcodeAvailable()) return reject('Barcode scanner is not defined')
      this.scanner.encode(encodingType, text, (res: any) => {
        resolve(res)
      }, err => {
        reject(err)
      })
    })
  }
}
