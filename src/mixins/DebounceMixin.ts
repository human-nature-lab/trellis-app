import debounce from 'lodash/debounce'
import { setDot } from '../services/JSONUtil'
export default {
  methods: {
    debounceModel (key: string, delay: number, opts = {}): Function {
      return debounce(val => {
        debugger
        setDot(this, key, val)
      }, delay, opts)
    }
  }
}
