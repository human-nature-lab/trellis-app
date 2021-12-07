<template>
  <v-col class="translation">
    <component
      v-if="isEditing"
      :is="useTextArea ? 'v-textarea' : 'v-text-field'"
      :class="{ code: isCode }"
      v-model="editingValue"
      :label="locale.languageNative"
      :loading="isWorking"
      append-icon="mdi-content-save"
      append-outer-icon="mdi-close"
      :error-messages="error ? [error.toString()] : []"
      @click:append="save"
      @click:append-outer="isEditing = false" />
    <div v-else>
      {{translationText.translatedText}}
      <v-icon @click="startEditing">mdi-pencil</v-icon>
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
    data () {
      return {
        isEditing: false,
        isWorking: false,
        editingValue: null as string,
        error: null as Error,
      }
    },
    methods: {
      startEditing () {
        this.isEditing = true
        this.editingValue = this.translationText.translatedText
      },
      async save () {
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
      translationTextIndex (): number {
        return this.value.translationText.findIndex(tt => tt.localeId === this.locale.id)
      },
      translationText (): TranslationText {
        return this.value.translationText[this.translationTextIndex]
      },
      isCode (): boolean {
        return this.translationText && this.translationText.translatedText.trim().startsWith('<')
      },
      useTextArea (): boolean {
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
      font-family: Courier New, Courier, monospace
</style>