<script setup lang="ts">
import global from '@/static/singleton'

</script>

<template>
  <v-app
    :class="{ 'print-mode' : global.printMode, 'cpu-optimized': global.cpuOptimized }"
  >
    <v-navigation-drawer
      v-model="global.menuDrawer.open"
      app
    >
      <slot name="drawer" />
    </v-navigation-drawer>
    <v-app-bar app>
      <slot name="app-bar" />
    </v-app-bar>
    <v-progress-linear
      :active="global.loading && global.loading.active"
      indeterminate
      absolute
    />
    <v-main>
      <slot />
    </v-main>
    <slot name="footer" />
    <slot name="dialog" />
  </v-app>
</template>
