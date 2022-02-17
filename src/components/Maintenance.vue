<template>
  <v-container>
    <h2 class="text-center">
      Trellis is currently in maintenance mode and will return shortly.
    </h2>
    <p class="mt-2 text-center">
      Please check back in a few minutes or wait for this page to automatically reload when Trellis has returned.
    </p>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import maintenanceService from '../services/maintenance'

  export default Vue.extend({
    name: 'Maintenance',
    props: {
      value: Boolean,
    },
    data () {
      return {
        status: {
          active: this.value,
        },
        intervalId: null,
      }
    },
    async created () {
      this.status = await maintenanceService.getStatus()
      if (this.status.active) {
        this.intervalId = setInterval(this.check, 5 * 60 * 1000)
      }
    },
    beforeDestroy () {
      clearInterval(this.intervalId)
    },
    methods: {
      async check() {
        this.status = await maintenanceService.getStatus()
        if (!this.status.active) {
          this.$emit('input', false)
          clearInterval(this.intervalId)
        }
      },
    }
  })
</script>

<style lang="sass">
  
</style>