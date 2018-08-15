<template>
  <span v-show="isVisible">
    <slot></slot>
  </span>
</template>

<script>
  import UserService from '../services/user/UserService'
  export default {
    name: 'permission',
    props: {
      roleWhitelist: {
        default: () => []
      },
      roleBlacklist: {
        default: () => []
      }
    },
    beforeCreate () {
      UserService.loadCurrentUser().then(user => {
        this.user = user
      })
    },
    computed: {
      isVisible () {
        if (!this.user) return false
        if (this.roleWhitelist.length) {
          return this.userInWhitelist()
        } else {
          return !this.userInBlacklist()
        }
      }
    },
    data () {
      return {
        user: null,
        whitelist_: this.roleWhitelist.map(r => r.toLowerCase()),
        blacklist_: this.roleBlacklist.map(r => r.toLowerCase())
      }
    },
    methods: {
      isInList (list, val) {
        if (Array.isArray(list)) {
          return list.indexOf(val) > -1
        } else {
          return val === list
        }
      },
      userInWhitelist () {
        if (!this.roleWhitelist.length) return false
        let role = this.user.role.toLowerCase()
        return this.isInList(this.whitelist_, role)
      },
      userInBlacklist () {
        if (!this.roleBlacklist.length) return false
        let role = this.user.role.toLowerCase()
        this.isInList(this.blacklist_, role)
      }
    }
  }
</script>
