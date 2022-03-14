<template>
  <v-menu left offset-x>
    <template #activator="{ on, attrs }">
      <v-btn class="ml-3" text icon v-on="on" v-bind="{ ...attrs, ...$attrs }">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <slot />
      <v-list-item v-if="removable" :disabled="disabled" @click="$emit('remove')">
        <v-list-item-icon>
          <v-icon color="error">mdi-delete</v-icon>
        </v-list-item-icon>
        <v-list-item-content>{{ $t('remove') }}</v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    removable: Boolean,
    disabled: Boolean,
  }
})
</script>