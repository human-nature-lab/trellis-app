import UserService from '../services/user/UserService'
import global from '../static/singleton'
let alreadyLoadedUser = false
export default {
  data () {
    return {
      global
    }
  },
  beforeDestroy () {
    alreadyLoadedUser = false
  },
  beforeCreate () {
    if (this.global && !this.global.user) {
      UserService.loadCurrentUser().then(user => {
        // Only call this once
        if (!alreadyLoadedUser) {
          this.global.user = user
          alreadyLoadedUser = true
        }
      })
    }
  },
  methods: {
    hasRole (roles) {
      if (!roles.length || !this.global.user || !this.global.user.role) return false
      let role = this.global.user.role.toLowerCase()
      return roles.map(r => r.toLowerCase()).indexOf(role) !== -1
    },
    notInRole (roles) {
      return !this.hasRole(roles)
    }
  }
}
