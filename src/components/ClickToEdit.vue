<template>
  <v-flex :class="{disabled: disabled}">
    <v-text-field
      :disabled="disabled"
      :readonly="!isEditing"
      dense
      solo
      :flat="!isEditing"
      :autofocus="isEditing"
      :append-icon="isEditing ? 'save' : 'edit'"
      :prepend-icon="isEditing ? 'clear' : ''"
      :prepend-icon-cb="resetEditorState"
      :append-icon-cb="isEditing ? save : startEditing"
      v-model="memText"
      class="min-text-field" />
  </v-flex>
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
        memText: this.text,
        isEditing: false
      }
    },
    watch: {
      text () {
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
        this.isEditing = false
      },
      save () {
        if (this.hasEdits) {
          this.$emit('save', this.memText)
        } else {
          this.resetEditorState()
        }
      },
      startEditing () {
        this.isEditing = true
      }
    }
  }
</script>

<style lang="sass">
  .min-text-field
    display: inline-block
    padding-top: 0
    .input-group__details
      display: none
</style>
