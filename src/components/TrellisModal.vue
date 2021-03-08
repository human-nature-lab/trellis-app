<template>
    <v-dialog
      :value="value"
      @input="$emit('input', $event)">
      <slot name="title">
        <ModalTitle
          :title="title"
          @close="onClose" />
      </slot>
      <template #activator="data">
        <slot name="activator" v-bind="data" />
      </template>
      <v-card>
        <v-container fluid>
          <slot />
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
  import ModalTitle from './ModalTitle.vue'
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
