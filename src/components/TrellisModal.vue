<template>
    <v-dialog
      ref="dialog"
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
  import Vue from 'vue'
  import ModalTitle from './ModalTitle.vue'
  export default Vue.extend({
    name: 'TrellisModal',
    components: { ModalTitle },
    props: {
      value: {
        type: Boolean,
        required: false,
      },
      title: {
        type: String,
        required: false,
      },
    },
    methods: {
      onClose ($event: any) {
        // @ts-ignore
        this.$refs.dialog.onClickOutside($event)
        this.$emit('close')
        this.$emit('input', false)
      }
    }
  })
</script>
