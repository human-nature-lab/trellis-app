<template>
  <v-flex @click="activate" :class="{disabled: disabled}">
    <v-dialog
      :value="value"
      @input="$emit('input', $event)"
      content-class="top-dialog"
      lazy>
      <v-flex slot="activator" class="body-1 pa-1 editable">
        <v-icon small>edit</v-icon>
        <span>{{memText}}</span>
      </v-flex>
      <v-card>
        <v-container>
          <slot>
            <v-layout row>
              <v-text-field
                autofocus
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
                <v-icon>clear</v-icon>
              </v-btn>
            </v-layout>
          </slot>
        </v-container>
      </v-card>
    </v-dialog>
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
        memText: this.text
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
  .top-dialog
    z-index: 500
  .editable
    cursor: pointer
</style>
