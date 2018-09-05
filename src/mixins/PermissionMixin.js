import UserService from '../services/user/UserService'
import global from '../static/singleton'
export default {
  data () {
    return {
      global
    }
  },
  beforeCreate () {
    if (this.global && !this.global.user) {
      UserService.loadCurrentUser().then(user => {
        // Only update the global user once
        if (!this.global.user) {
          this.global.user = user
        }
      })
    }
  },
  methods: {
    hasRole (roles) {
      if (!roles.length || !this.global.user || !this.global.user.role) return false
      let role = this.global.user.role.toLowerCase()
      debugger
      return roles.map(r => r.toLowerCase()).indexOf(role) !== -1
    },
    notInRole (roles) {
      return !this.hasRole(roles)
    }
  }
}
