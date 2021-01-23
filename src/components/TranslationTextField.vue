<template>
  <v-container @click.stop>
    <v-layout row wrap class="translation-text-container">
      <ClickToEdit
        v-model="editingText"
        :editing="isEditing"
        :editable="editable"
        @update:editing="updateState"
        :disabled="saving"
        @save="onSave" />
      <v-select
        dense
        class="small-select"
        :items="locales"
        item-text="languageTag"
        item-value="id"
        v-model="selectedLocale"
        :disabled="saving || isEditing" />
    </v-layout>
  </v-container>
</template>

<script lang="ts">
  import { Mutex } from 'async-mutex'
  import Locale from '../entities/trellis/Locale'
  import TranslationText from '../entities/trellis/TranslationText'
  import LocaleService from '../services/locale/LocaleService'
  import SingletonService from '../services/SingletonService'
  import TranslationTextService from '../services/translation-text/TranslationTextService'
  import ClickToEdit from './ClickToEdit'
  import singleton, {Singleton} from '../static/singleton'
  import Vue from 'vue'

  // Hoist studyLocales show it can be shared by all instances of this component
  const studyLocales = []
  let localesMutex = new Mutex()

  // React to the study being changed
  SingletonService.on('study', () => {
    if (studyLocales.length) {
      studyLocales.splice(0, studyLocales.length)
    }
  })

  export default Vue.extend({
    name: 'TranslationTextField',
    components: { ClickToEdit },
    props: {
      translation: {
        type: Object,
        required: true
      },
      persist: {
        type: Boolean,
        default: true
      },
      editable: {
        type: Boolean,
        default: true
      },
      editing: {
        type: Boolean,
        default: false
      }
    },
    created () {
      this.loadLocales()
    },
    data () {
      return {
        global: singleton as Singleton,
        saving: false,
        isEditing: this.editing,
        selectedLocale: singleton.locale.id,
        isLoading: false,
        locales: studyLocales as () => Locale[]
      }
    },
    computed: {
      tt () {
        for (const tt of this.memCopy.translationText) {
          if (tt.localeId === this.selectedLocale) {
            return tt
          }
        }
        // Create a new TranslationText for the locale if it doesn't exist yet. Will not be persisted unless changes are made.
        const tt = new TranslationText()
        tt.localeId = this.selectedLocale
        tt.translatedText = ''
        this.memCopy.translationText.push(tt)
        return tt
      },
      editingText: {
        get (): string {
          return this.tt.translatedText
        },
        set (val): string {
          this.tt.translatedText = val
        }
      },
      memCopy () {
        return this.translation.copy()
      }
    },
    methods: {
      updateState (editingState) {
        this.isEditing = editingState
        if (!this.isEditing) {
          this.$emit('cancelled')
        }
      },
      async onSave (newText) {

        this.saving = true
        this.tt.translatedText = newText

        // If any other language has an empty string, use the current string field for the value
        for (let tt of this.memCopy.translationText) {
          if (!tt.translatedText || !tt.translatedText.length) {
            tt.translatedText = newText
          }
        }

        if (this.persist) {
          // Save any changed translationText elements
          for (let i = 0; i < this.memCopy.translationText.length; i++) {
            const mTt = this.memCopy.translationText[i]
            const tt = this.translation.translationText.find(t => t.localeId === mTt.localeId)
            if (!tt) {
              // Save a new translation text
              this.memCopy.translationText[i] = await TranslationTextService.createTranslationText(this.translation.id, mTt)
            } else if (tt.translatedText !== mTt.translatedText) {
              // Update an existing translation text
              this.memCopy.translationText[i] = await TranslationTextService.updateTranslatedTextById(mTt.id, mTt.translatedText)
            }
          }
        }

        this.$emit('save', this.memCopy)
        this.saving = false
        this.isEditing = false
      },
      async loadLocales (): Promise<void> {
        // To avoid making multiple requests for the same resource, we add a caching layer and a mutex
        if (this.locales.length) return
        try {
          let release = await localesMutex.acquire()
          // If we are the first component we should actually get the locales. Otherwise, don't make a request
          if (!this.locales.length) {
            const locales = await LocaleService.getStudyLocales(this.global.study.id)
            this.locales.splice(0, 0, ...locales) // keep the shared reference here
          }
          release()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to load locales')
          }
        }
      }
    }
  })
</script>

<style lang="sass">
  $width: 60px
  .small-select
    display: inline-block
    max-width: $width
    padding-top: 8px
    margin-left: 1em
    min-width: $width
    .input-group__details
      display: none
  .translation-text-container
    border: 1px solid rgba(0,0,0,0.12)
</style>
