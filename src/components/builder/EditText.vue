<template>
  <div>
    <AutoTextField
      v-if="editing"
      v-model="copy"
      autofocus
      dense
      hide-details
      :textarea="textarea"
      @blur="onBlur"
      append-icon="mdi-content-save"
      append-outer-icon="mdi-close"
      :outlined="outlined"
      @click:append="save"
      @click:append-outer="cancel"
      @keyup.enter="saveEnter"
      v-bind="$attrs"
    />
    <!-- Handle empty values -->
    <span v-else-if="value === ''">
      <slot name="empty" :editable="canEdit" :textarea="textarea">
        <span v-if="canEdit" :class="{ outlined: outlined && canEdit }">
          <v-btn @click="startEdit" :disabled="!canEdit" :text="!textarea">
            {{ missingText }}
            <v-icon class="ml-2">mdi-plus</v-icon>
          </v-btn>
        </span>
        <span v-else>{{ missingText }}</span>
      </slot>
    </span>
    <!-- Handle code formatting -->
    <pre
      v-else-if="code"
      @click="startEdit"
      :class="{ pointer: canEdit, outlined: outlined && canEdit }"
      v-bind="$attrs"
      v-on="$listeners"
    ><code>{{ loading ? copy : value }}</code></pre>
    <!-- Handle non-editable text -->
    <span
      v-else
      :class="{ pointer: canEdit }"
      @click="startEdit"
      v-bind="$attrs"
      v-on="$listeners"
    >{{ loading ? copy : value }}</span>
    <v-progress-linear v-if="loading" :height="2" indeterminate />
  </div>
</template>

<script lang="ts">
import { builder } from '../../symbols/builder'
import Vue from 'vue'
import AutoTextField from './AutoTextField.vue'
import { i18n } from '../../i18n'

export default Vue.extend({
  name: 'EditText',
  components: { AutoTextField },
  inject: { builder },
  props: {
    value: String,
    locked: Boolean,
    loading: Boolean,
    editable: Boolean,
    disabled: Boolean,
    textarea: Boolean,
    code: Boolean,
    outlined: Boolean,
    missingText: {
      type: String,
      default: () => i18n.t('add_text')
    }
  },
  data() {
    return {
      copy: this.value,
      editing: false,
    }
  },
  methods: {
    onBlur() {
      if (!this.dirty) {
        this.cancel()
      }
    },
    save() {
      if (this.dirty) {
        this.$emit('update', this.copy)
        this.$emit('save', this.copy)
      }
      this.setEditing(false)
    },
    setEditing(val: boolean) {
      this.editing = val
      this.$emit('update:editing', val)
    },
    saveEnter() {
      if (!this.textarea) {
        this.save()
      }
    },
    cancel() {
      this.setEditing(false)
    },
    startEdit() {
      if (this.canEdit) {
        this.copy = this.value
        this.setEditing(true)
      }
    }
  },
  computed: {
    dirty(): boolean {
      return this.value !== this.copy
    },
    canEdit(): boolean {
      return !this.locked && !this.disabled && this.editable
    }
  }
})
</script>

<style lang="sass" scoped>
.outlined
  border: 2px solid lightgrey
  border-radius: 5px
</style>