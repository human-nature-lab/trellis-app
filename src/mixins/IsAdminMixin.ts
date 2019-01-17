import global from '../static/singleton'
import Role from "../components/user/Role";
import {Vue} from 'vue/types/vue'
export default {
  data () {
    return {
      global
    }
  },
  computed: {
    isAdmin (this: Vue): boolean {
      // @ts-ignore
      return !!this.global && !!this.global.user && this.global.user.role === Role.ADMIN
    },
  }
}
