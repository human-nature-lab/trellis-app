<template>
  <v-navigation-drawer
    :width="width"
    disable-resize-watcher
    disable-route-watcher
    right
    app
    v-model="isOpen">
    <v-navigation-drawer
      right
      app
      v-model="isTOCOpen">
      <DocsTOC
        :preventLinkPropagation="true"
        @navigation="openDoc" />
    </v-navigation-drawer>
    <v-toolbar flat>
      <v-toolbar-title>
        {{$t('documentation')}}
      </v-toolbar-title>
      <v-spacer />
      <v-btn @click="isTOCOpen = true">
        <v-icon>toc</v-icon>
      </v-btn>
    </v-toolbar>
    <Documentation
      v-if="currentFile"
      @navigation="openDoc"
      :preventLinkPropagation="true"
      :currentFile="currentFile" />
  </v-navigation-drawer>
</template>

<script lang="ts">
  import DocsTOC from './DocsTOC'
  import Documentation from './Documentation'
  import Vue from 'vue'
  import bus, {DocsEventTypes} from './DocsEventBus'
  export default Vue.extend({
    components: {DocsTOC, Documentation},
    name: 'DocsSidebar',
    async created () {
      bus.$on(DocsEventTypes.open, this.openDoc)
      bus.$on(DocsEventTypes.close, () => {
        this.isOpen = false
      })
      const docs = (await import('./docs')).default
      this.names = docs.names
    },
    destroyed () {
      bus.$off(DocsEventTypes.open)
      bus.$off(DocsEventTypes.close)
    },
    data () {
      return {
        isOpen: false,
        isTOCOpen: false,
        currentFile: '',
        names: []
      }
    },
    computed: {
      width (): number {
        // TODO: Handle various screen widths
        return 400
      }
    },
    methods: {
      openDoc (fileKey?: string) {
        console.log('opening doc', fileKey)
        // TODO: Check if the fileKey is an exact match. If it isn't find the closest match.
        this.isOpen = true
        if (fileKey) {
          this.currentFile = fileKey.substr(0, 2) === './' ? fileKey : './' + fileKey
          this.isTOCOpen = false
        } else {
          this.isTOCOpen = true
        }
      }
    }
  })
</script>

<style scoped>

</style>
