<template>
  <div>
    <v-navigation-drawer
      :width="width"
      disable-resize-watcher
      disable-route-watcher
      right
      app
      v-model="isOpen">
      <v-toolbar flat>
        <v-btn icon @click="openTOC">
          <v-icon>toc</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{$t('documentation')}}
          <a
            v-if="isWeb"
            :href="newTabLink"
            target="_blank"
            class="btn btn--flat btn--icon">
            <v-icon>launch</v-icon>
          </a>
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="isOpen = false">
          <v-icon>arrow_forward</v-icon>
        </v-btn>
      </v-toolbar>
      <Documentation
        v-if="currentFile"
        @navigation="openDoc"
        :preventLinkPropagation="true"
        :currentFile="currentFile" />
    </v-navigation-drawer>
    <v-navigation-drawer
      disable-resize-watcher
      right
      app
      :width="width"
      v-model="isTOCOpen">
      <DocsTOC
        :preventLinkPropagation="true"
        @close="closeTOC"
        @navigation="openDoc" />
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
  import DocsTOC from './DocsTOC'
  import Documentation from './Documentation'
  import Vue from 'vue'
  import bus, {DocsEventTypes} from './DocsEventBus'
  import router from '../../router'
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
      },
      newTabLink (): object {
        const route = router.resolve({
          name: 'Documentation',
          params: {
            filePath: this.currentFile.slice(2)
          }
        })
        return route.href
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
      },
      openTOC () {
        this.isTOCOpen = true
        this.isOpen = false
      },
      closeTOC () {
        this.isTOCOpen = false
        this.isOpen = true
      }
    }
  })
</script>
