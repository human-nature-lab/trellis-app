<template>
  <v-row no-gutters class="align-center px-1">
    <v-icon @click="$emit('update:visible', !visible)">{{visible ? 'mdi-chevron-down' : 'mdi-chevron-right'}}</v-icon>
    <div class="text-h6">
      <Translation v-model="section.nameTranslation" editable :locale="builder.locale" :locked="builder.locked" />
    </div>
    <v-spacer />
    <v-chip v-if="followUpId">{{ $t('follow_up_to', builder.locale.languageTag, [questions[followUpId] ? questions[followUpId].varName : 'Loading...']) }}</v-chip>
    <v-chip v-if="isRepeatable">{{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}</v-chip>
    <v-chip v-if="!visible">{{$tc('n_pages', pageCount)}}</v-chip>
    <v-chip v-if="!visible">{{$tc('n_questions', questionCount)}}</v-chip>
    <DotsMenu>
      <v-list>
        <v-list-item @click="$emit('addPage')">{{ $t('add_page', builder.locale.languageTag) }}</v-list-item>
        <v-list-item>{{ $t('show_follow_up', builder.locale.languageTag) }}</v-list-item>
        <v-list-item>{{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}</v-list-item>
      </v-list>
    </DotsMenu>
  </v-row>
</template>

<script lang="ts">
import Section from '../../entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Translation from './Translation.vue'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  name: 'SectionHeader',
  mixins: [FormQuestionsMixin],
  components: { Translation, DotsMenu },
  inject: { builder },
  props: {
    section: Object as PropOptions<Section>,
    visible: Boolean,
  },
  computed: {
    followUpId(): string {
      return this.section && this.section.formSections[0].followUpQuestionId
    },
    isRepeatable(): boolean {
      return this.section && this.section.formSections[0].isRepeatable
    },
    maxRepetitions(): number {
      return this.section && this.section.formSections[0].maxRepetitions
    },
    pageCount (): number {
      return  this.section.pages.length
    },
    questionCount (): number {
      let count = 0
      for (let i = 0; i < this.section.pages.length; i++) {
        count += this.section.pages[i].questions.length
      }
      return count
    }
  }
})
</script>

<style lang="sass" scoped>
  .v-chip
    margin-left: 3px
    margin-right: 3px
  .sticky
    top: 70px
    background: #f5f5f5
    z-index: 110
</style>