<template>
    <v-dialog
      lazy
      :value="value"
      @input="$emit('input', $event)">
      <ModalTitle
        :title="title"
        @close="$emit('input', false)" />
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
    }
  }
</script>
