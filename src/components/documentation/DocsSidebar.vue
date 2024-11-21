<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DocsTOC from './DocsTOC.vue'
import Documentation from './Documentation.vue'
import { routeQueue } from '../../router'
import { docsSidebarOpen, docsTocOpen, docsCurrentFile, openSidebarLink } from '@/helpers/docs.helper'

const docs = ref()
const names = ref()
const width = 500

onMounted(async () => {
  docs.value = (await import('./docs')).default
  names.value = docs.value.names
})

const newTabLink = computed(() => {
  if (!docsCurrentFile.value) {
    return ''
  }
  return '/documentation' + docsCurrentFile.value
})

function openTOC () {
  docsTocOpen.value = true
  docsSidebarOpen.value = false
}

function closeTOC () {
  docsTocOpen.value = false
  docsSidebarOpen.value = true
}

</script>

<template>
  <div>
    <v-navigation-drawer
      :width="width"
      disable-resize-watcher
      disable-route-watcher
      right
      app
      v-model="docsSidebarOpen"
    >
      <v-toolbar flat>
        <v-btn
          icon
          @click="openTOC"
        >
          <v-icon>mdi-table-of-contents</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t('documentation') }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="isWeb"
          :to="newTabLink"
          target="_blank"
          icon
          flat
        >
          <v-icon>mdi-launch</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="docsSidebarOpen = false"
        >
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-toolbar>
      <Documentation
        v-if="docsCurrentFile"
        @click-link="openSidebarLink"
        :prevent-link-propagation="true"
        :current-file="docsCurrentFile"
      />
    </v-navigation-drawer>
    <v-navigation-drawer
      disable-resize-watcher
      right
      app
      :width="width"
      v-model="docsTocOpen"
    >
      <DocsTOC
        :prevent-link-propagation="true"
        @close="closeTOC"
        @click-link="openSidebarLink"
      />
    </v-navigation-drawer>
  </div>
</template>
