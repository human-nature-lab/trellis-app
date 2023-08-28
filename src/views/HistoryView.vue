<script setup lang="ts">
import { computed, ref } from 'vue'
import { history } from '../router/history'

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
  for (const item of history.value) {
    const date = new Date(item.timestamp)
    const group = groups.find(g => g.date === date.toLocaleDateString())
    item.title = item.title.replace('| Trellis', '')
    if (group) {
      group.items.push(item)
    } else {
      groups.push({
        date: date.toLocaleDateString(),
        items: [item],
      })
    }
  }
  return groups
})

const openPanels = ref(0)

</script>

<template>
  <v-container>
    <h2>{{ $t('history') }}</h2>
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
              <v-icon v-if="iconMap[item.route.name]">
                {{ iconMap[item.route.name] }}
              </v-icon>
              <v-icon v-else>
                mdi-delta
              </v-icon>
              <span class="mx-2">{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
               - 
              <span class="mx-2">{{ item.title }} ({{ item.route.name }})</span>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style lang="sass">

</style>
