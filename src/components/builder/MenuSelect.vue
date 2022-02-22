<template>
  <v-menu offset-y v-bind="$attrs" :disabled="disabled" max-height="400">
    <template #activator="{ attrs, on }">
      <v-chip v-bind="attrs" v-on="disabled ? null : on" :color="color">
      {{ selected }}
      <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
      </v-chip>
    </template>
    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item[itemValue]"
        @click="select(item)"
      >{{ item[itemText] }}</v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuSelect',
  props: {
    items: Array,
    value: Object,
    disabled: Boolean,
    color: String,
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    returnObject: Boolean,
  },
  methods: {
    select(item: object): void {
      if (this.returnObject) {
        this.$emit('input', item)
        this.$emit('change', item)
      } else {
        this.$emit('input', item[this.itemValue])
        this.$emit('change', item[this.itemValue])
      }
    },
  },
  computed: {
    selected(): string {
      for (const item of this.items) {
        if (this.returnObject && item === this.value) {
          return item[this.itemText]
        } else if (item[this.itemValue] === this.value) {
          return item[this.itemText]
        }
      }
    }
  }
})
</script>

<style lang="sass">

</style>