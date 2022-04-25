import barcode from '../../../services/barcode'
import { LoggingLevel } from '../../../services/logging/LoggingTypes'
import PT from '../../../static/parameter.types'
export default {
  computed: {
    showBarcodeScanner () {
      // TODO: Add the parameter and check that it actually exists here
      // @ts-ignore
      return this.isCordova && this.question && !!this.question.questionParameters.find(qp => parseInt(qp.parameterId, 10) === PT.allow_barcode)
    },
    barcodeIcon () {
      return this.showBarcodeScanner ? 'scanner' : undefined
    }
  },
  methods: {
    async scan (options?: phonegapBarcode.BarcodeScanOptions) {
      const res = await barcode.scan(options)
      // @ts-ignore
      this.log({
        severity: LoggingLevel.debug,
        message: `barcode of type ${res.format} of val ${res.text}`
      })
      return res.text
    },
    encode (type: phonegapBarcode.EncodingType, text: string) {
      return barcode.encode(type, text)
    }
  }
}
