<template>
  <v-col class="translation" v-bind="$attrs">
    <EditText
      :class="{ code: isCode }"
      :value="editingValue"
      :textarea="useTextArea"
      :label="locale.languageNative"
      :loading="loading || isWorking"
      autofocus
      :rows="rows"
      :missingText="$t('no_translation_for', [locale.languageName])"
      :error-messages="error ? [error.toString()] : []"
      v-bind="$attrs"
      @save="save"
      :code="isCode"
    />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import EditText from './EditText.vue'
import Translation from '../../entities/trellis/Translation'
import TranslationText from '../../entities/trellis/TranslationText'
import TranslationTextService from '../../services/translation-text'
import Locale from '../../entities/trellis/Locale'

export default Vue.extend({
  name: 'Translation',
  components: { EditText },
  props: {
    value: Object as PropOptions<Translation>,
    locale: Object as PropOptions<Locale>,
    loading: Boolean,
    textarea: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      isWorking: false,
      height: 100,
      error: null as Error,
    }
  },
  methods: {
    async save(newText: string) {
      if (this.isWorking) return
      try {
        this.isWorking = true
        if (this.translationText) {
          // Update the existing translation text
          const updatedTt = await TranslationTextService.updateTranslatedTextById(this.translationText.id, newText)
          const t: Translation = this.value.copy()
          t.translationText[this.translationTextIndex] = updatedTt
          this.$emit('input', t)
        } else {
          // create a new translation text
          let tt = new TranslationText()
          tt.translatedText = newText
          tt.localeId = this.locale.id
          tt.translationId = this.value.id
          tt = await TranslationTextService.createTranslationText(this.value.id, tt)
          const t: Translation = this.value.copy()
          t.translationText[this.translationTextIndex] = tt
          this.$emit('input', t)
        }
      } catch (err) {
        this.error = err.response.data.msg
      } finally {
        this.isWorking = false
      }
    }
  },
  computed: {
    editingValue(): string {
      if (this.translationText) {
        return this.translationText.translatedText
      }
      return ''
    },
    translationTextIndex(): number {
      return this.value.translationText.findIndex(tt => tt.localeId === this.locale.id)
    },
    translationText(): TranslationText | undefined {
      if (this.value && this.value.translationText && this.value.translationText.length) {
        return this.value.translationText[this.translationTextIndex]
      }
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