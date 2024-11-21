<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { docsTocOpen, docsSidebarOpen, openSidebarLink } from '@/helpers/docs.helper'
import Documentation from './Documentation.vue'

const content = ref()
const fileName = '_Sidebar.md'

function close () {
  docsTocOpen.value = false
  docsSidebarOpen.value = true
}

onMounted(async () => {
  const d = await import(/* webpackChunkName: "documentation" */'./docs')
  const docs = d.default
  content.value = docs.content[fileName]
})
</script>

<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        Table of contents
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click="close"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container>
      <v-layout>
        <Documentation
          current-file="_Sidebar.md"
          @click-link="(to, isExternal) => $emit('click-link', to, isExternal)"
        />
      </v-layout>
    </v-container>
  </v-flex>
</template>
