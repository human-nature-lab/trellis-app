<template>
  <v-col class="pa-0">
    <v-row
      no-gutters
      class="align-center"
    >
      <v-icon @click="setVisible(!visible)">
        {{ visible ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      </v-icon>
      <div class="text-h6">
        <Translation
          v-model="section.nameTranslation"
          editable
          :locale="builder.locale"
          :locked="disabled || builder.locked"
        />
      </div>
      <v-spacer />
      <BuilderChip
        :visible="!visible"
        @click="setVisible(true)"
      >
        {{ $tc('n_pages', pageCount) }}
      </BuilderChip>
      <BuilderChip
        :visible="!visible"
        @click="setVisible(true)"
      >
        {{ $tc('n_questions', questionCount) }}
      </BuilderChip>
      <BuilderChip :visible="!!section.linkedFormSections.length">
        {{ $tc('linked_to_forms_n', section.linkedFormSections.length) }}
      </BuilderChip>
      <MenuSelect
        :disabled="builder.locked"
        nullable
        @change="$emit('update:followUp', $event)"
        v-model="section.formSections[0].followUpQuestionId"
        :items="questionsList"
        item-value="id"
        class="ml-2"
        item-text="varName"
      >
        <template #selected="{ item: questionId }">
          {{ questionId ? $t('follow_up_to', [questionId in questions ? questions[questionId].varName : $t('unknown_question')]) : $t('no_follow_up') }}
        </template>
      </MenuSelect>
      <v-slide-x-transition>
        <MenuSelect
          v-if="section.formSections[0].followUpQuestionId"
          class="ml-2"
          :disabled="builder.locked"
          @change="$emit('update:randomizeFollowUp', $event)"
          :value="!!section.formSections[0].randomizeFollowUp"
          :items="randomizeOptions"
        />
      </v-slide-x-transition>
      <BuilderChip
        :visible="isRepeatable"
      >
        {{ $tc('repeated', maxRepetitions, builder.locale.languageTag) }}
      </BuilderChip>
      <DotsMenu
        :disabled="disabled || builder.locked"
        removable
        class-name="section-handle"
        @remove="$emit('remove')"
      >
        <v-list-item
          :disabled="builder.locked"
          @click="$emit('addPage')"
        >
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>{{ $t('add_page', builder.locale.languageTag) }}</v-list-item-content>
        </v-list-item>
      </DotsMenu>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Section from '@/entities/trellis/Section'
import Vue, { PropOptions } from 'vue'
import Translation from './Translation.vue'
import FormQuestionsMixin from '@/mixins/FormQuestionsMixin'
import { builder } from '@/symbols/builder'
import DotsMenu from '@/components/util/DotsMenu.vue'
import MenuSelect from '@/components/util/MenuSelect.vue'
import BuilderChip from './BuilderChip.vue'

export default Vue.extend({
  name: 'SectionHeader',
  mixins: [FormQuestionsMixin],
  components: { Translation, DotsMenu, MenuSelect, BuilderChip },
  inject: { builder },
  props: {
    section: Object as PropOptions<Section>,
    visible: Boolean,
    disabled: Boolean,
  },
  data () {
    return {
      randomizeOptions: [{
        text: 'Randomized',
        value: true,
      }, {
        text: 'Ordered',
        value: false,
      }],
    }
  },
  methods: {
    setVisible (val: boolean) {
      this.$emit('update:visible', val)
    },
  },
  computed: {
    followUpId (): string {
      return this.section && this.section.formSections[0].followUpQuestionId
    },
    isRepeatable (): boolean {
      return this.section && this.section.formSections[0].isRepeatable
    },
    maxRepetitions (): number {
      return this.section && this.section.formSections[0].maxRepetitions
    },
    pageCount (): number {
      return this.section.pages.length
    },
    questionCount (): number {
      let count = 0
      for (let i = 0; i < this.section.pages.length; i++) {
        count += this.section.pages[i].questions.length
      }
      return count
    },
  },
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
