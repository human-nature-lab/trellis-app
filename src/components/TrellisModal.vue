<template>
  <v-dialog
    ref="dialog"
    v-bind="$attrs"
    v-on="$listeners"
    :value="value"
    :persistent="persistent"
    @input="$emit('input', $event)"
    class="d-flex flex-column"
  >
    <ScrollContainer
      :elevation="2"
      container-class="white"
    >
      <template #header>
        <slot name="title">
          <ModalTitle
            :title="title"
            :disabled="persistent"
            @close="onClose"
          />
        </slot>
      </template>
      <v-card class="h-full">
        <v-container fluid>
          <slot />
        </v-container>
      </v-card>
    </ScrollContainer>
  </v-dialog>
</template>

<script lang="ts">
import { i18n } from '@/i18n'
import Vue from 'vue'
import ModalTitle from './ModalTitle.vue'
import ScrollContainer from './styles/ScrollContainer.vue'
export default Vue.extend({
  name: 'TrellisModal',
  components: { ModalTitle, ScrollContainer },
  props: {
    value: {
      type: Boolean,
      required: false,
    },
    title: {
      type: String,
      default: '',
    },
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClose ($event: any) {
      // @ts-ignore
      this.$refs.dialog.onClickOutside($event)
      this.$emit('close')
      this.$emit('input', false)
    },
  },
})
</script>

<style lang="sass">
  .trellis-dialog-content
    position: relative
    // overflow: hidden !important
</style>
