<template>
  <TrellisModal title="Web Login" v-model="isOpen" @close="onClose">
    <LoginForm @login="done" />
  </TrellisModal>
</template>

<script lang="ts">
  import Vue from 'vue'
  import LoginForm from './LoginForm'
  import TrellisModal from '../TrellisModal'

  let component: typeof Vue
  
  export function requestCredentials(): Promise<Creds> {
    return new Promise((resolve, reject) => {
      if (!component) {
        return reject(new Error("Must put the LoginModal into the DOM somewhere"))
      }
      // @ts-ignore
      component.getCreds(resolve, reject)
    })
  }

  export function clearCredentials() {
    if (!component) {
      return new Error("Must put the LoginModal into the DOM somewhere")
    }
    // @ts-ignore
    component.reset()
  }

  type Creds = { username, password }

  export default Vue.extend({
    name: 'LoginModal',
    components: { LoginForm, TrellisModal },
    data () {
      return {
        isOpen: false,
        username: null,
        password: null,
        resolve: null as (Creds) => void,
        reject: null as (Error) => void,
      }
    },
    created () {
      component = this
    },
    beforeDestroy () {
      component = null
    },
    methods: {
      getCreds (resolve: (Creds) => void, reject: (Error) => void) {
        this.isOpen = true
        this.resolve = resolve
        this.reject = reject
      },
      reset () {
        this.username = null
        this.password = null
      },
      done (username: string, password: string) {
        this.isOpen = false
        this.resolve({ username, password })
      },
      onClose () {
        this.reject(new Error("Login skipped"))
      }
    }
  })
</script>

<style lang="sass">
  
</style>