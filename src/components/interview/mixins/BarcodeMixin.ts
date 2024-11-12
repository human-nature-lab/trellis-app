import barcode from '@/services/barcode'
import { LoggingLevel } from '@/services/logging/LoggingTypes'
import PT from '@/static/parameter.types'
export default {
  computed: {
    showBarcodeScanner () {
      return this.isCordova && this.question && !!this.question.questionParameters.find(qp => parseInt(qp.parameterId, 10) === PT.allow_barcode)
    },
    barcodeIcon () {
      return this.showBarcodeScanner ? 'mdi-barcode' : undefined
    },
  },
  methods: {
    async scan (options?: phonegapBarcode.BarcodeScanOptions) {
      const res = await barcode.scan(options)
      // @ts-ignore
      this.log({
        severity: LoggingLevel.debug,
        message: `barcode of type ${res.format} of val ${res.text}`,
      })
      return res.text
    },
    encode (type: phonegapBarcode.EncodingType, text: string) {
      return barcode.encode(type, text)
    },
  },
}
