<script setup lang="ts">
import { computed, ref } from 'vue'
import { history, removeHistoryItem, clearHistory } from '../router/history'
import HistoryTitle from '@/components/history/HistoryTitle.vue'

const viewIcons = {
  'mdi-account-group': ['Respondent', 'RespondentsSearch', 'RespondentForms'], // respondents
  'mdi-view-list': ['Interview'], // interview
  'mdi-map-marker': ['GeoSearch', 'GeoSearchWithMap', 'Geo'], // geos
  'mdi-information': ['Info', 'Changelog'],
}

const iconMap = {}
for (const icon in viewIcons) {
  for (const view of viewIcons[icon]) {
    iconMap[view] = icon
  }
}

const dateGroups = computed(() => {
  const groups = []
  for (let i = 0; i < history.value.length; i++) {
    const item = history.value[i]
    const date = new Date(item.timestamp)
    const group = groups.find(g => g.date === date.toLocaleDateString())
    if (group) {
      group.items.push({ index: i, ...item })
    } else {
      groups.push({
        date: date.toLocaleDateString(),
        items: [{ index: i, ...item }],
      })
    }
  }
  return groups
})

const openPanels = ref(0)

</script>

<template>
  <v-container>
    <v-col>
      <v-row class="no-gutters">
        <h2>{{ $t('history') }}</h2>
        <v-spacer />
        <v-btn @click="clearHistory">
          {{ $t('clear') }}
        </v-btn>
      </v-row>
    </v-col>
    <v-expansion-panels v-model="openPanels">
      <v-expansion-panel
        v-for="group in dateGroups"
        :key="group.date"
      >
        <v-expansion-panel-header>{{ group.date }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list>
            <v-list-item
              v-for="(item, index) in group.items"
              :key="item.route.path + index"
              :to="{ name: item.route.name, params: item.route.params }"
            >
              <v-list-item-avatar>
                <v-icon v-if="iconMap[item.route.name]">
                  {{ iconMap[item.route.name] }}
                </v-icon>
                <v-icon v-else>
                  mdi-delta
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-title>
                <HistoryTitle :route="item" />
              </v-list-item-title>
              <v-list-item-action>
                <v-btn
                  @click.prevent="removeHistoryItem(item.index)"
                  text
                  color="error"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style lang="sass">

</style>
