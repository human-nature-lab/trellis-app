<template>
  <v-col class="ma-0 pa-0">
    <v-row no-gutters class="align-center px-1">
      <v-icon @click="setVisible(!visible)">{{ visible ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
      <div class="text-h6">
        <Translation
          v-model="section.nameTranslation"
          editable
          :locale="builder.locale"
          :locked="builder.locked"
        />
      </div>
      <v-spacer />
      <v-chip
        v-if="followUpId && !showFollowUp"
      >{{ $t('follow_up_to', builder.locale.languageTag, [questions[followUpId] ? questions[followUpId].varName : 'Loading...']) }}</v-chip>
      <v-chip v-if="isRepeatable && !showRepeated">{{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}</v-chip>
      <DotsMenu :disabled="builder.locked" removable @remove="$emit('remove')">
        <v-list-item :disabled="builder.locked" @click="$emit('addPage')">
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>{{ $t('add_page', builder.locale.languageTag) }}</v-list-item-content>
        </v-list-item>
        <ToggleItem
          :value="showFollowUp"
          @input="$emit('update:showFollowUp', $event)"
          :onTitle="$t('hide_follow_up')"
          :offTitle="$t('show_follow_up')"
        />
        <ToggleItem
          :value="showRepeated"
          @input="$emit('update:showRepeated', $event)"
          :onTitle="$t('hide_repeated')"
          :offTitle="$t('show_repeated')"
        />
      </DotsMenu>
    </v-row>
    <v-row class="ml-8 ma-0 pa-0" no-gutters v-if="!visible">
      <v-chip @click="setVisible(true)">{{ $tc('n_pages', pageCount) }}</v-chip>
      <v-chip @click="setVisible(true)">{{ $tc('n_questions', questionCount) }}</v-chip>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Section from '../../entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Translation from './Translation.vue'
import FormQuestionsMixin from '../../mixins/FormQuestionsMixin'
import { builder } from '../../symbols/builder'
import DotsMenu from './DotsMenu.vue'
import ToggleItem from './ToggleItem.vue'

export default Vue.extend({
  name: 'SectionHeader',
  mixins: [FormQuestionsMixin],
  components: { Translation, DotsMenu, ToggleItem },
  inject: { builder },
  props: {
    section: Object as PropOptions<Section>,
    visible: Boolean,
    showFollowUp: Boolean,
    showRepeated: Boolean,
  },
  methods: {
    setVisible(val: boolean) {
      this.$emit('update:visible', val)
    }
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
    pageCount(): number {
      return this.section.pages.length
    },
    questionCount(): number {
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