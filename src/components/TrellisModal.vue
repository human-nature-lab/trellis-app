<template>
    <v-dialog
      lazy
      :value="value"
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
    props: {
      value: Boolean,
      title: String
    },
    methods: {
      onClose () {
        this.$emit('close')
        this.$emit('input', false)
      }
    }
  }
</script>
