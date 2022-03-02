<template>
  <v-col class="translation">
    <EditText
      :class="{ code: isCode }"
      v-model="editingValue"
      :textarea="useTextArea"
      :label="locale.languageNative"
      :loading="isWorking"
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
import TranslationTextService from '../../services/translation-text/TranslationTextService'
import Locale from '../../entities/trellis/Locale'

export default Vue.extend({
  name: 'Translation',
  components: { EditText },
  props: {
    value: Object as PropOptions<Translation>,
    locale: Object as PropOptions<Locale>,
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
    async save() {
      if (this.isWorking) return
      try {
        this.isWorking = true
        // TODO: Need to create new translationText records when none are present already
        const updatedTt = await TranslationTextService.updateTranslatedTextById(this.translationText.id, this.editingValue)
        const t: Translation = this.value.copy()
        t.translationText[this.translationTextIndex] = updatedTt
        this.$emit('input', t)
      } catch (err) {
        this.error = err.response.data.msg
      } finally {
        this.isWorking = false
      }
    }
  },
  computed: {
    editingValue: {
      get(): string {
        if (this.translationText) {
          return this.translationText.translatedText
        }
        return ''
      },
      set(val: string) {
        if (this.translationText)
          this.translationText.translatedText = val
      }
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