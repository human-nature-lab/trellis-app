<template>
  <v-col class="translation" :class="{ pointer: editable }">
    <component
      v-if="isEditing"
      ref="input"
      :is="useTextArea ? 'v-textarea' : 'v-text-field'"
      :class="{ code: isCode }"
      v-model="editingValue"
      :label="locale.languageNative"
      :loading="isWorking"
      append-icon="mdi-content-save"
      append-outer-icon="mdi-close"
      autofocus
      :rows="rows"
      @blur="onBlur"
      :error-messages="error ? [error.toString()] : []"
      v-bind="$attrs"
      @keyup.enter="saveEnter"
      @click:append="save"
      @click:append-outer="isEditing = false"
    />
    <div v-else @click="startEditing">
      <pre v-if="isCode"><code>{{ editingValue || translationText.translatedText }}</code></pre>
      <span v-else>{{ editingValue || translationText.translatedText }}</span>
      <v-icon @click="save" v-if="dirty" color="warning">mdi-content-save</v-icon>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Locale from '../../entities/trellis/Locale'
import Translation from '../../entities/trellis/Translation'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextService from '../../services/translation-text/TranslationTextService'

export default Vue.extend({
  name: 'Translation',
  props: {
    value: Object as PropOptions<Translation>,
    locale: Object as PropOptions<Locale>,
    editable: {
      type: Boolean,
      default: false,
    },
    textarea: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      isEditing: false,
      isWorking: false,
      height: 100,
      editingValue: null as string,
      error: null as Error,
    }
  },
  methods: {
    startEditing() {
      if (this.editable) {
        this.isEditing = true
        this.editingValue = this.translationText.translatedText
      }
    },
    onBlur() {
      this.isEditing = false
    },
    saveEnter() {
      if (!this.useTextArea) {
        this.save()
      }
    },
    async save() {
      try {
        this.isWorking = true
        const updatedTt = await TranslationTextService.updateTranslatedTextById(this.translationText.id, this.editingValue)
        const t: Translation = this.value.copy()
        t.translationText[this.translationTextIndex] = updatedTt
        this.$emit('input', t)
        this.isEditing = false
      } catch (err) {
        this.error = err.response.data.msg
      } finally {
        this.isWorking = false
      }
    }
  },
  computed: {
    translationTextIndex(): number {
      return this.value.translationText.findIndex(tt => tt.localeId === this.locale.id)
    },
    translationText(): TranslationText {
      return this.value.translationText[this.translationTextIndex]
    },
    isCode(): boolean {
      const t = this.translationText ? this.translationText.translatedText.trim() : ''
      return t.startsWith('<') || t.startsWith('&#60;')
    },
    rows(): number {
      return this.translationText ? this.translationText.translatedText.split('\n').length : 1
    },
    useTextArea(): boolean {
      return this.textarea || this.isCode
    },
    dirty(): boolean {
      return this.editingValue && this.editingValue !== this.translationText.translatedText
    }
  }
})
</script>

<style lang="sass">

.translation
  textarea
    width: 100%
  .code
    &, textarea
      font-family: Courier New, Courier, monospace
</style>