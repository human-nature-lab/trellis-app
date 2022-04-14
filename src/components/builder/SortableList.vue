<template>
  <v-list>
    <draggable
      :list="value"
      @start="onStart"
      @end="onEnd"
      :group="group"
      @change="onChange"
    >
      <v-list-item
        v-for="(item, index) in value"
        :key="item[itemKey]"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        >
          {{ item }}
        </slot>
      </v-list-item>
    </draggable>
  </v-list>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import draggable from 'vuedraggable'

type MoveElement<T> = { element: T, oldIndex: number, newIndex: number }
export type Moved<T> = MoveElement<T>
export type Added<T> = Pick<MoveElement<T>, 'element' | 'newIndex'>
export type Removed<T> = Pick<MoveElement<T>, 'element' | 'oldIndex'>

type MoveEvent = { added: Added<any> } | { moved: Moved<any> } | { removed: Removed<any> }

export default Vue.extend({
  name: 'SortableList',
  components: { draggable },
  props: {
    value: Array as PropOptions<any[]>,
    group: String,
    itemKey: {
      type: String,
      default: 'id',
    },
  },
  data () {
    return {
      dragging: false,
    }
  },
  methods: {
    onStart () {
      this.dragging = true
    },
    onEnd () {
      this.dragging = false
    },
    onChange (ev: MoveEvent) {
      this.$emit('change', ev)
      if (ev.moved) {
        this.$emit('moved', ev.moved)
      } else if (ev.added) {
        this.$emit('added', ev.added)
      } else if (ev.removed) {
        this.$emit('removed', ev.removed)
      }
    },
  },
})
</script>

<style lang="sass">

</style>
