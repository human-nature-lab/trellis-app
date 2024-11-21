<template>
  <v-row
    class="pa-1 banner no-gutters"
    v-if="serverMode === 'demo' || serverMode === 'test'"
    :style="{ backgroundColor }"
  >
    <v-toolbar-title>
      <span v-if="serverMode === 'demo'">
        {{ $t('demo_alert') }}
      </span>
      <span v-else-if="serverMode === 'test'">
        {{ $t('test_alert') }}
      </span>
    </v-toolbar-title>
    <v-btn
      v-if="serverMode === 'demo' && isWeb && !isLoggedIn"
      :to="{name: 'DemoSignUp'}"
    >
      {{ $t('sign_up') }}
    </v-btn>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import IsLoggedInMixin from '../mixins/IsLoggedInMixin'
import PlatformMixin from '../mixins/PlatformMixin'

export default Vue.extend({
  name: 'Banner',
  mixins: [IsLoggedInMixin, PlatformMixin],
  props: {
    serverMode: String,
  },
  computed: {
    backgroundColor () {
      return this.serverMode === 'test' ? 'yellow' : 'orange'
    },
  },
})
</script>

<style lang="sass">

</style>
