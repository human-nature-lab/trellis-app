import {Vue} from "vue/types/vue";

export default {
  errorCaptured (err: Error, vm: Vue, info: string) {
    try {
      // @ts-ignore
      this.log(err)
      // @ts-ignore
      this.alert('error', info, {timeout: 0})
    } catch (nerr) {
      console.error(nerr)
    }
  }
}
