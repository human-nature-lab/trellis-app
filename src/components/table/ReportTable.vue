<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Table } from './types'
import type { BasePlugin } from '@revolist/revogrid'
import VGrid from '@revolist/vue-datagrid'
import { useVuetify } from '@/helpers/vuetify.helper'

const props = defineProps<{
  table: Table<any>
}>()

const vuetify = useVuetify()

const columns = computed(() => {
  return props.table.header.map(header => {
    return {
      prop: header.key,
      name: header.label,
      readonly: true,
      sortable: !!header.sortable,
      filterable: !!header.filterable,
      width: header.width,
    }
  })
})

const grid = ref<typeof VGrid | null>(null)
const gridReady = ref(false)

type RevoGridWebComponent = HTMLElement & {
  getPlugins?: () => Promise<BasePlugin[]>
}

type VGridInstance = {
  $refs?: {
    wc?: RevoGridWebComponent
  }
}

async function exportData () {
  if (!grid.value || !gridReady.value) return

  const gridInstance = grid.value as unknown as VGridInstance
  const webComponent = gridInstance?.$refs?.wc
  const pluginGetter = webComponent?.getPlugins?.bind(webComponent)

  if (!pluginGetter) return

  const plugins = await pluginGetter()
  plugins.forEach(plugin => {
    if (plugin?.exportFile) {
      plugin.exportFile({ filename: 'report' })
    }
  })
}
</script>

<template>
  <v-col>
    <v-row
      v-if="table.title || table.filters"
      class="no-gutters"
    >
      <h3 v-if="table.title">
        {{ table.title }}
      </h3>
      <v-spacer />
      {{ table.filters }}
    </v-row>
    <VGrid
      ref="grid"
      @aftergridinit="gridReady = true"
      class="grid"
      :source="table.rows"
      :columns="columns"
      :auto-size-column="true"
      :filter="true"
      :resize="true"
      :stretch="true"
      :sort="true"
      :exporting="true"
      :theme="vuetify.theme.dark ? 'darkMaterial' : 'material'"
    />
    <v-row class="no-gutters">
      <v-col>
        {{ props.table.rows.length }} rows
      </v-col>
      <v-col>
        <v-btn
          @click="exportData"
          :disabled="!gridReady"
        >
          <v-icon>mdi-export</v-icon>
          Export
        </v-btn>
      </v-col>
    </v-row>
  </v-col>
</template>

<style lang="sass" scoped>
.grid
  height: calc(100% - 30px)
</style>
