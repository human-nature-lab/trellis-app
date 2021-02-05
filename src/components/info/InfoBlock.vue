<template>
  <v-card :ripple="!!to" tile :to="to">
    <v-card-text>
      <v-container>
        <v-row class="display-1 mb-2">{{title}}</v-row>
        <v-row v-if="component" :is="component"></v-row>
        <v-row v-else row v-for="pair in items" :key="pair.key">
          <v-flex class="subheading">{{pair.key}}</v-flex>
          <v-spacer />
          <v-flex v-if="pair.component" class="text-sm-right body-2">
            <component :is="pair.component"></component>
          </v-flex>
          <v-flex v-else class="text-sm-right body-2">
            <span v-if="pair.val !== null">{{pair.val}}</span>
            <v-progress-circular
              v-else
              color="primary"
              indeterminate
              :size="16"></v-progress-circular>
          </v-flex>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    name: 'InfoBlock',
    props: {
      to: Object,
      component: Object,
      items: Array as () => object[],
      title: String
    }
  })
</script>
