<template>
  <v-menu offset-y :disabled="disabled" max-height="400">
    <template #activator="{ attrs, on }">
      <v-chip v-bind="attrs" v-on="disabled ? null : on" :color="color">
      {{ selected }}
      <v-icon v-if="!disabled">mdi-chevron-down</v-icon>
      </v-chip>
    </template>
    <v-list>
      <v-list-item v-if="nullable" @click="select(null)">
        {{ $t('none') }}
      </v-list-item>
      <v-list-item
        v-for="item in items"
        :key="string ? item : item[itemValue]"
        @click="select(item)"
      >{{ string ? item : item[itemText] }}</v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuSelect',
  props: {
    items: Array,
    value: [Object, String, Number, Symbol, Boolean],
    disabled: Boolean,
    nullable: Boolean,
    color: String,
    label: String,
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
    select(item: object | string | null): void {
      if (!item || this.string || this.returnObject) {
        this.$emit('input', item)
        this.$emit('change', item)
      } else {
        this.$emit('input', item[this.itemValue])
        this.$emit('change', item[this.itemValue])
      }
    },
  },
  computed: {
    string (): boolean {
      return this.items ? typeof this.items[0] === 'string' : false
    },
    selected(): string {
      if (!this.value && this.label) {
        return this.label
      }
      if (this.string) {
        return this.value
      }
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