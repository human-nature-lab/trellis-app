<template>
  <v-expansion-panel v-if="isInDebugMode" class="red--text">
    <v-expansion-panel-header>
      <div class="debug-name">DEBUG: {{ name }}</div>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <slot />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import config from '../config'

export default Vue.extend({
  name: 'debug',
  props: {
    name: {
      type: String,
      default: 'Debug'
    }
  },
  data: function () {
    return {
      isOpen: true,
    }
  },
  computed: {
    isInDebugMode: function () {
      return config.debug
    }
  }
})

</script>
