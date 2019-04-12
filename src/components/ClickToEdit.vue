<template>
  <v-flex :class="{disabled: disabled}">
    <v-text-field
      ref="textField"
      :disabled="disabled"
      :readonly="!editing"
      dense
      solo
      :flat="!editing"
      :append-icon="appendIcon"
      :prepend-icon="editing ? 'clear' : ''"
      :prepend-icon-cb="resetEditorState"
      :append-icon-cb="editing ? save : startEditing"
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
        default: ''
      },
      text: {
        type: String,
        required: false,
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
      }
    },
    data() {
      return {
        memText: this.value
      }
    },
    watch: {
      value() {
        this.resetEditorState()
      }
    },
    computed: {
      hasEdits (): boolean {
        return this.memText !== this.value
      },
      appendIcon (): string {
        if (!this.editable) {
          return null
        } else if (this.editing) {
          return 'save'
        } else {
          return 'edit'
        }
      }
    },
    methods: {
      resetEditorState() {
        this.memText = this.value
        this.$emit('update:editing', false)
      },
      save() {
        if (this.hasEdits) {
          this.$emit('save', this.memText)
        } else {
          this.resetEditorState()
        }
      },
      startEditing() {
        this.$emit('update:editing', true)
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
