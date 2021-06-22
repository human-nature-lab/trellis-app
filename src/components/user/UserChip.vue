<template>
  <v-chip 
    v-bind="$attrs"
    v-on="$listeners"
    :close="close">
    <v-icon small class="mr-2">mdi-account</v-icon>
    {{ loading || error ? $t('loading') : name }}
    <v-progress-circular v-if="loading" size="10" indeterminate class="ml-2" />
  </v-chip>
</template>

<script lang="ts">
  import Vue from 'vue'
import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'

  export default Vue.extend({
    name: 'UserChip',
    props: {
      value: String,
      close: Boolean
    },
    data () {
      return {
        loading: false,
        user: null as User,
        error: null
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        try {
          this.loading = true
          this.user = await UserService.getUser(this.value)
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }
      }
    },
    computed: {
      name (): string {
        return this.user.name
      }
    }
  })
</script>

<style lang="sass">
  
</style>