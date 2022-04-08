import { debounce } from 'lodash'
import { setDot } from '../services/JSONUtil'
export default {
  methods: {
    debounceModel (key: string, delay: number, opts = {}): Function {
      return debounce(val => {
        setDot(this, key, val)
      }, delay, opts)
    }
  }
}
