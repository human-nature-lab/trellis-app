<template>
  <v-dialog
    ref="dialog"
    v-bind="$attrs"
    v-on="$listeners"
    :value="value"
    @input="$emit('input', $event)"
    class="d-flex flex-column"
  >
    <ScrollContainer :elevation="2">
      <template #header>
        <slot name="title">
          <ModalTitle
            :title="title"
            @close="onClose"
          />
        </slot>
      </template>
      <v-card tile>
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
      default: i18n.t('dialog'),
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
  .h-full
    max-height: 100%
    overflow: hidden
</style>
