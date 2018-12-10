<template>
  <v-flex class="ma-3">
    <v-layout>
      <v-container class="markdown">
        <div v-html="html"></div>
      </v-container>
    </v-layout>
    <v-navigation-drawer right app v-model="isNavOpen">
      <v-container>
        <h3>TOC</h3>
        <v-list>
          <v-list-tile v-for="file in files" @click="selectFile(file)">
            <v-list-tile-content>
              {{file.slice(2, -3)}}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-container>
    </v-navigation-drawer>
  </v-flex>
</template>

<script>
  import * as marked from 'marked'
  import requireAll from "../classes/requireAll"
  import global from '../static/singleton'

  const changelog =  requireAll(require.context('../../changelog/', true, /\.md$/))
  export default {
    name: 'Changelog',
    beforeRouteEnter (to, from, next) {
      global.secondaryDrawer.isEnabled = true
      global.secondaryDrawer.onClick = this.toggleDrawer
      next()
    },
    beforeRouteLeave (to, from, next) {
      global.secondaryDrawer.isEnabled = false
      global.secondaryDrawer.onClick = null
      next()
    },
    data () {
      const files = Object.keys(changelog)
      return {
        isNavOpen: true,
        selectedFile: files[0],
        files,
        changelog
      }
    },
    methods: {
      selectFile (name) {
        this.selectedFile = name
      },
      toggleDrawer () {
        this.isNavOpen = !this.isNavOpen
      }
    },
    computed: {
      html () {
        return this.selectedFile && this.changelog[this.selectedFile] ? marked(this.changelog[this.selectedFile]) : ''
      }
    }
  }
</script>

<style lang="sass">
  $listPadding: 30px
  .markdown
    ul
      margin-block-start: 1em
      margin-block-end: 1em
      padding-inline-start: $listPadding
</style>
