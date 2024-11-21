<script setup lang="ts">
import { ref } from 'vue'
import DocsTOC from '@/components/documentation/DocsTOC.vue'
import { setSecondaryDrawerIconForView } from '@/helpers/drawer.helper'
import { routeQueue } from '@/router'

const isTocOpen = ref(false)
setSecondaryDrawerIconForView('mdi-table-of-contents', () => {
  console.log('docs toc open', isTocOpen.value)
  isTocOpen.value = !isTocOpen.value
})

function updateRoute (href, isExternal) {
  if (isExternal) {
    window.open(href, '_blank')
  } else {
    href = href.replace('/#/', '/')
    routeQueue.push(href)
  }
}
</script>

<template>
  <v-flex>
    <v-container>
      <router-view @click-link="updateRoute" />
    </v-container>
    <v-navigation-drawer
      right
      app
      v-model="isTocOpen"
    >
      <DocsTOC
        @close="isTocOpen = false"
        @click-link="updateRoute"
      />
    </v-navigation-drawer>
  </v-flex>
</template>
