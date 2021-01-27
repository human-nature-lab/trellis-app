<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{$t('server_config')}}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="showAddDialog = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items-per-page="entries.length"
      hide-default-footer
      :loading="isLoading"
      :items="entries">
      <template v-slot:item="{ item }">
        <ConfigRow
          @update="updateEntry"
          :entry="item" />
      </template>
    </v-data-table>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import ConfigRow from '../components/config/ConfigRow.vue'
  import Config from '../entities/trellis/Config'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import ConfigService from '../services/config'

  export default Vue.extend({
    name: 'ServerConfig',
    mixins: [DocsLinkMixin('./admin/ServerConfiguration.md')],
    components: { ConfigRow },
    data () {
      return {
        isLoading: false,
        showAddDialog: false,
        entries: [] as Config[],
        headers: [{
          text: this.$t('key'),
          value: 'key'
        }, {
          text: this.$t('value'),
          value: 'value'
        }, {
          text: this.$t('default_value'),
          value: 'defaultValue'
        }]
      }
    },
    async created () {
      try {
        this.isLoading = true
        this.entries = await ConfigService.getAll()
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      } finally {
        this.isLoading = false
      }
    },
    methods: {
      updateEntry (entry: Config) {
        const index = this.entries.findIndex(e => e.key === entry.key)
        if (index > -1) {
          this.entries.splice(index, 1, entry)
        }
      }
    }
  })
</script>
