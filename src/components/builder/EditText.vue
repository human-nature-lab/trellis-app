<template>
  <span>
    <v-text-field
      v-if="editing"
      v-model="copy"
      autofocus
      @blur="onBlur"
      append-icon="mdi-content-save"
      append-outer-icon="mdi-close"
      @click:append="save"
      @click:append-outer="cancel"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <span
       v-else
       :class="{ pointer: !disabled && editable }" 
       @click="startEdit" v-bind="$attrs" v-on="$listeners">{{ value }}</span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'EditText',
  props: {
    value: String,
    editable: Boolean,
    loading: Boolean,
  },
  data() {
    return {
      copy: '',
      editing: false,
    }
  },
  methods: {
    onBlur() {
      if (!this.dirty) {
        this.cancel()
      }
    },
    save() {
      if (this.dirty) {
        this.$emit('update', this.copy)
        this.$emit('save', this.copy)
      }
      this.editing = false
    },
    cancel() {
      this.editing = false
    },
    startEdit() {
      if (this.editable) {
        this.copy = this.value
        this.editing = true
      }
    }
  },
  computed: {
    dirty(): boolean {
      return this.value !== this.copy
    }
  }
})
</script>

<style lang="sass">

</style>