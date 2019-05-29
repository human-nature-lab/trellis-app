import { TrellisRole } from '../static/permissions.base'
import global from '../static/singleton'
import { Vue } from 'vue/types/vue'
export default {
  data () {
    return {
      global
    }
  },
  computed: {
    isAdmin (this: Vue): boolean {
      // @ts-ignore
      return !!this.global && !!this.global.user && this.global.user.role === TrellisRole.ADMIN
    },
  }
}
