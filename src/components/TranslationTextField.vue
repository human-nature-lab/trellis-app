<template>
  <v-container grid-list-xl fluid>
    <v-layout wrap>
      <v-flex xs10>
        <v-text-field
          v-on:keyup="onChangeTranslation"
          v-model="textFieldValue"
          :autofocus="true"
          :disabled="saving">
        </v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-select
          v-on:change="onChangeLocale"
          :items="languageTags"
          v-model="selectedLanguageTag"
          :disabled="saving">
        </v-select>
      </v-flex>
      <v-btn flat @click="onSave" :disabled="!enableSave || saving">Save</v-btn>
      <v-btn flat @click="onCancel" :disabled="saving">Cancel</v-btn>
    </v-layout>
  </v-container>
</template>

<script>
  import TranslationTextService from '../services/translation-text/TranslationTextService'
  import singleton from '../static/singleton'
  export default {
    name: 'translation-text-field',
    created: function () {
      this.translation.translationText.forEach((translationText) => {
        this.languageTags.push(translationText.locale.languageTag)
        this.textFieldValues[translationText.locale.languageTag] = translationText.translatedText
      })
      this.selectedLanguageTag = this.global.locale.languageTag
      this.textFieldValue = this.textFieldValues[this.selectedLanguageTag]
    },
    data: function () {
      return {
        global: singleton,
        textFieldValues: {},
        textFieldValue: '',
        languageTags: [],
        selectedLanguageTag: '',
        enableSave: false,
        saving: false
      }
    },
    methods: {
      onSave: async function () {
        this.saving = true
        // Persist any changes to the current translation
        this.textFieldValues[this.selectedLanguageTag] = this.textFieldValue

        // Save any changed translationText elements
        for (const translationText of this.translation.translationText) {
          if (translationText.translatedText !== this.textFieldValues[translationText.locale.languageTag]) {
            translationText.translatedText = this.textFieldValues[translationText.locale.languageTag]
            if (this.persist) {
              await TranslationTextService.updateTranslatedTextById(translationText.id, this.textFieldValues[translationText.locale.languageTag])
            }
          }
        }
        this.$emit('editing-done', this.translation)
      },
      onCancel: async function () {
        this.$emit('editing-cancelled')
      },
      onChangeLocale: function (locale) {
        // Persist any changes to the current translation
        this.textFieldValues[this.selectedLanguageTag] = this.textFieldValue
        // Retrieve the text for the new locale
        this.textFieldValue = this.textFieldValues[locale]
      },
      onChangeTranslation: function () {
        this.enableSave = this.isEdited()
      },
      isEdited: function () {
        let edited = false
        this.translation.translationText.forEach((translationText) => {
          if ( (translationText.locale.languageTag === this.selectedLanguageTag &&
                this.textFieldValue !== translationText.translatedText) ||
               (translationText.locale.languageTag !== this.selectedLanguageTag &&
                 (this.textFieldValues[translationText.locale.languageTag] !== translationText.translatedText)) ) {
            edited = true
          }
        })
        return edited
      }
    },
    props: {
      translation: {
        type: Object,
        required: true
      },
      persist: {
        type: Boolean,
        required: false,
        'default': true
      }
    }
  }
</script>

<style scoped>

</style>
