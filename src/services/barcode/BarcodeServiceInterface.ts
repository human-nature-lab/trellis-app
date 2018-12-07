export default interface BarcodeServiceInterface {
  scan (options?: phonegapBarcode.BarcodeScanOptions): Promise<phonegapBarcode.BarcodeScanResult>
  encode (encodingType: phonegapBarcode.EncodingType, data: string): Promise<any>
}
