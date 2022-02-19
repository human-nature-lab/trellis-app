<template>
  <v-menu offset-y v-bind="$attrs">
    <template #activator="{ attrs, on }">
      <v-chip v-bind="attrs" v-on="on" color="primary lighten-3">{{ selected }}</v-chip>
    </template>
    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item[itemValue]"
        @click="select(item)"
      >{{ item[itemTitle] }}</v-list-item>
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
    itemTitle: {
      type: String,
      default: 'title',
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
          return item[this.itemTitle]
        } else if (item[this.itemValue] === this.value) {
          return item[this.itemTitle]
        }
      }
    }
  }
})
</script>

<style lang="sass">

</style>