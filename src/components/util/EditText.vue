<template>
  <div>
    <v-row
      v-if="code"
      no-gutters
      v-click-outside="onBlur"
    >
      <v-col
        class="ma-0"
        cols="11"
      >
        <CodeEditor
          v-model="copy"
          :readonly="disabled || locked || !editing"
          :language="language"
          @click="startEdit"
        />
      </v-col>
      <v-col
        v-if="editing"
        cols="1"
        class="ma-0"
      >
        <v-btn
          icon
          @click="save"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="cancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <AutoTextField
      v-else-if="editing"
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
      <slot
        name="empty"
        :editable="canEdit"
        :textarea="textarea"
      >
        <span
          v-if="canEdit"
          :class="{ outlined: outlined && canEdit }"
        >
          <v-btn
            @click="startEdit"
            :disabled="!canEdit"
            :text="!textarea"
          >
            {{ missingText }}
            <v-icon class="ml-2">mdi-plus</v-icon>
          </v-btn>
        </span>
        <span v-else>{{ missingText }}</span>
      </slot>
    </span>
    <!-- Handle non-editable text -->
    <span
      v-else
      :class="{ pointer: canEdit }"
      @click="startEdit"
      v-bind="$attrs"
      v-on="$listeners"
    >{{ loading ? copy : value }}</span>
    <v-progress-linear
      v-if="loading"
      :height="2"
      indeterminate
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { builder } from '@/symbols/builder'
import AutoTextField from './AutoTextField.vue'
import { i18n } from '@/i18n'
import CodeEditor from './CodeEditor.vue'

export default Vue.extend({
  name: 'EditText',
  components: { AutoTextField, CodeEditor },
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
    language: {
      type: String,
      default: 'html',
    },
    missingText: {
      type: String,
      default: () => i18n.t('add_text'),
    },
  },
  data () {
    return {
      copy: this.value,
      editing: false,
    }
  },
  methods: {
    onBlur () {
      if (!this.dirty) {
        this.cancel()
      }
    },
    save () {
      if (this.dirty) {
        this.$emit('update', this.copy)
        this.$emit('save', this.copy)
      }
      this.setEditing(false)
    },
    setEditing (val: boolean) {
      this.editing = val
      this.$emit('update:editing', val)
    },
    saveEnter () {
      if (!this.textarea) {
        this.save()
      }
    },
    cancel () {
      this.setEditing(false)
    },
    startEdit () {
      if (this.canEdit) {
        this.copy = this.value
        this.setEditing(true)
      }
    },
  },
  computed: {
    dirty (): boolean {
      return this.value !== this.copy
    },
    canEdit (): boolean {
      return !this.locked && !this.disabled && this.editable
    },
  },
})
</script>

<style lang="sass" scoped>
.outlined
  border: 2px solid lightgrey
  border-radius: 5px
</style>
