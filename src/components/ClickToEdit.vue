<template>
  <v-flex :class="{disabled: disabled}">
    <v-text-field
      ref="textField"
      :disabled="disabled"
      :readonly="!internal.editing"
      :dense="dense"
      :solo="solo"
      :label="label"
      :flat="!internal.editing"
      :append-icon="appendIcon"
      :prepend-icon="internal.editing ? 'clear' : ''"
      @click:prepend="resetEditorState"
      @click:append="internal.editing ? save : startEditing"
      v-model="memText"
      @keyup.enter="save"
      class="min-text-field" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  export default Vue.extend({
    name: 'ClickToEdit',
    props: {
      value: {
        type: String,
        default: 'Empty'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      autofocus: {
        type: Boolean,
        default: true
      },
      editable: {
        type: Boolean,
        default: true
      },
      editing: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
        default: ''
      },
      dense: {
        type: Boolean,
        default: true
      },
      solo: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        memText: this.value,
        internal: {
          editing: this.editing
        }
      }
    },
    watch: {
      value (newVal) {
        if (this.memText === newVal) return
        this.resetEditorState()
      },
      editing (val) {
        this.internal.editing = val
      }
    },
    computed: {
      hasEdits (): boolean {
        return this.memText !== this.value
      },
      appendIcon (): string {
        if (!this.editable) {
          return null
        } else if (this.internal.editing) {
          return 'save'
        } else {
          return 'edit'
        }
      }
    },
    methods: {
      resetEditorState() {
        this.memText = this.value
        this.internal.editing = false
        this.$emit('update:editing', this.internal.editing)
      },
      save() {
        if (this.hasEdits) {
          this.$emit('save', this.memText)
        } else {
          this.resetEditorState()
        }
      },
      startEditing() {
        this.internal.editing = true
        this.$emit('update:editing', this.internal.editing)
        // Focus on the input box
        if (this.autofocus && this.$refs.textField && this.$refs.textField.$el) {
          const input = this.$refs.textField.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      }
    }
  })
</script>

<style lang="sass">
  .min-text-field
    display: inline-block
    padding-top: 0
    .input-group__details
      display: none
</style>
