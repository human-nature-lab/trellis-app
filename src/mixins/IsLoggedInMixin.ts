import global from '../static/singleton'

export default {
  data () {
    return {
      global
    }
  },
  computed: {
    isLoggedIn (): boolean {
      // @ts-ignore
      return !!this.global && !!this.global.user
    },
  }
}
