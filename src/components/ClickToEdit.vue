<template>
  <span @click="activate" :class="{disabled: disabled}" class="b-inline">
    <slot
      v-hide="value"
      name="activator">
      <div>{{memText}}</div>
    </slot>
    <slot v-hide="!value">
      <v-text-field
        autofocus
        solo
        @blur="resetEditorState"
        :disabled="disabled"
        v-model="memText" />
      <v-btn
        icon
        :disabled="!hasEdits || disabled"
        @click.stop
        @mousedown="save">
        <v-icon>save</v-icon>
      </v-btn>
      <v-btn
        icon
        :disabled="disabled"
        @click="resetEditorState()">
        <v-icon>remove</v-icon>
      </v-btn>
    </slot>
  </span>
</template>

<script>
  export default {
    name: 'ClickToEdit',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        required: false,
        default: 'Empty'
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        memText: this.text
      }
    },
    watch: {
      text () {
        debugger
        this.resetEditorState()
      }
    },
    computed: {
      hasEdits () {
        return this.memText !== this.text
      }
    },
    methods: {
      resetEditorState () {
        this.memText = this.text
        this.$emit('input', false)
      },
      save () {
        this.$emit('save', this.memText)
      },
      activate () {
        if (!this.value) {
          this.$emit('input', true)
        }
      }
    }
  }
</script>

<style lang="sass" scoped>
  .b-inline
    > *
      display: inline-block
  .disabled
    cursor: not-allowed
</style>
