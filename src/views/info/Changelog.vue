<template>
  <v-flex class="ma-4">
    <v-layout>
      <v-container>
        <v-layout class="w-full">
          <component class="w-full" :is="markdown" />
        </v-layout>
      </v-container>
    </v-layout>
    <v-navigation-drawer
      right
      app
      v-model="isNavOpen"
    >
      <v-container>
        <h3>Changelog</h3>
        <v-list>
          <v-list-item
            v-for="file in files"
            :key="file"
            @click="selectFile(file)"
          >
            <v-list-item-content>
              {{ file.slice(2, -3) }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>
  </v-flex>
</template>

<script>
import global from '@/static/singleton'
import { changelog } from '@/components/changelog/logs'

export default {
  name: 'Changelog',
  beforeRouteEnter (to, from, next) {
    global.secondaryDrawer.isEnabled = true
    global.secondaryDrawer.icon = 'mdi-delta'
    next()
  },
  beforeRouteLeave (to, from, next) {
    global.secondaryDrawer.isEnabled = false
    global.secondaryDrawer.icon = null
    global.secondaryDrawer.onClick = null
    next()
  },
  created () {
    global.secondaryDrawer.onClick = this.toggleDrawer
  },
  data () {
    const files = Object.keys(changelog).sort().reverse()
    return {
      isNavOpen: true,
      selectedFile: files[0],
      files,
      changelog,
    }
  },
  methods: {
    selectFile (name) {
      this.selectedFile = name
    },
    toggleDrawer () {
      this.isNavOpen = !this.isNavOpen
    },
  },
  computed: {
    markdown () {
      return this.selectedFile && this.changelog[this.selectedFile]
    },
  },
}
</script>
