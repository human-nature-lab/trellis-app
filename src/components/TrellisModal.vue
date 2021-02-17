<template>
    <v-dialog
      :fullscreen="fullscreen"
      :max-width="maxWidth"
      :value="value"
      :persistent="persistent"
      @input="$emit('input', $event)">
      <ModalTitle
        :title="title"
        @close="onClose" />
      <v-card>
        <v-container>
          <slot />
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
  import ModalTitle from './ModalTitle'
  export default {
    name: 'TrellisModal',
    components: { ModalTitle },
    computed: {
      maxWidth () {
        if (this.small) {
          return '20em'
        } else if (this.medium) {
          return '50em'
        } else {
          return ''
        }
      }
    },
    watch: {
      value(open) {
        if (open) {
          this.$emit('opened')
        }
      }
    },
    props: {
      value: Boolean,
      small:  {
        type: Boolean,
        required: false,
        default: false
      },
      medium:  {
        type: Boolean,
        required: false,
        default: false
      },
      large:  {
        type: Boolean,
        required: false,
        default: true
      },
      fullscreen:  {
        type: Boolean,
        required: false,
        default: false
      },
      title: String,
      persistent: Boolean
    },
    methods: {
      onClose () {
        this.$emit('close')
        this.$emit('input', false)
      }
    }
  }
</script>
