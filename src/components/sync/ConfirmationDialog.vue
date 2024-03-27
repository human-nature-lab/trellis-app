<template>
  <v-dialog
    v-model="visible"
    persistent
  >
    <v-card>
      <v-card-title>
        {{ $t('confirm') }}
      </v-card-title>
      <v-card-content>
        <p class="pa-4">
          <slot />
        </p>
      </v-card-content>
      <v-row
        class="pa-4"
        no-gutters
      >
        <v-spacer />
        <v-btn
          class="mr-2"
          @click="reject"
        >
          {{ $t('stop') }}
        </v-btn>
        <v-btn @click="resolve">
          {{ $t('continue') }}
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ConfirmationDialog',
  props: {
    value: Boolean,
  },
  data () {
    return {
      visible: false,
      resolve: null,
      reject: null,
    }
  },
  beforeDestroy () {
    if (this.reject) {
      this.reject()
    }
  },
  methods: {
    confirm () {
      return new Promise<boolean>((resolve, reject) => {
        this.resolve = () => resolve(true)
        this.reject = () => reject(new Error(this.$t('operation_canceled_by_user').toString()))
        this.visible = true
      }).finally(v => {
        this.visible = false
        return v
      })
    },
  },
})
</script>

<style lang="sass">

</style>
