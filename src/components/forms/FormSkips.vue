<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <SkipEditor
            :newSkip="addFormSkip"
            :deleteSkip="deleteFormSkip"
            @update="skipUpdated"
            :conditionTags="respondentConditionTags"
            subject="form"
            :skips="form.skips" />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn class="mb-2 mr-2" @click="$emit('close')">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Form from '../../entities/trellis/Form'
  import Skip from '../../entities/trellis/Skip'
  import SkipEditor from '../skips/SkipEditor.vue'
  import ConditionTagService from '../../services/condition-tag'
  import SkipService from '../../services/skip'
  import FormSkip from '../../entities/trellis/FormSkip'
  import AsyncTranslationText from '../AsyncTranslationText.vue'
  import ModalTitle from '../ModalTitle.vue'
  import TitleCase from '../../filters/TitleCase'

  export default Vue.extend({
    name: 'form-skips',
    components: {AsyncTranslationText, SkipEditor, ModalTitle},
    filters: {TitleCase},
    props: {
      form: Object as () => Form
    },
    async created () {
      try {
        this.respondentConditionTags = await ConditionTagService.respondent()
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    data () {
      return {
        respondentConditionTags: null
      }
    },
    methods: {
      async addFormSkip (skip: Skip) {
        try {
          const formSkip: FormSkip = await SkipService.createFormSkip(this.form.id, skip)
          this.form.skips.push(formSkip.skip)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Failed to create skip')
          }
        }
      },
      async deleteFormSkip (skip: Skip) {
        try {
          await SkipService.deleteFormSkip(this.form.id, skip.id)
          const index = this.form.skips.findIndex(s => s.id === skip.id)
          this.form.skips.splice(index, 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Failed to delete form skip')
          }
        }
      },
      skipUpdated (skip: Skip) {
        const index = this.form.skips.findIndex(s => s.id === skip.id)
        this.form.skips.splice(index, 1, skip)
      }
    }
  })
</script>

<style scoped>

</style>
