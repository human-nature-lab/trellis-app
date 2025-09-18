<template>
  <v-col class="section-content">
    <div
      v-if="visible"
      class="section-indicator"
    />
    <SectionHeader
      :visible.sync="visible"
      :section="value"
      @addPage="addPage"
      @remove="$emit('remove', $event)"
      @update:followUp="updateFollowUp"
      @update:randomizeFollowUp="randomizeFollowUp"
      @update:randomizePages="randomizePages"
    />
    <v-progress-linear
      v-if="working"
      indeterminate
    />
    <ExpandSection v-model="visible">
      <SortableList
        :value="value.questionGroups"
        group="pages"
        tag="v-col"
        class="pa-0"
        :disabled="builder.locked"
        handle=".page-handle"
        @moved="movedPage"
        @added="movedPage"
      >
        <template #item="{ item: page, index }">
          <Page
            :key="page.id"
            ref="pages"
            :index="index"
            @remove="removePage(page)"
            v-model="value.questionGroups[index]"
          />
        </template>
      </SortableList>
    </ExpandSection>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import ExpandSection from './ExpandSection.vue'
import FormBuilderService from '@/services/builder'
import Page from './Page.vue'
import QuestionGroup from '@/entities/trellis/QuestionGroup'
import Section from '@/entities/trellis/Section'
import SectionHeader from './SectionHeader.vue'
import SortableList, { Added, Moved } from '@/components/util/SortableList.vue'
import { builder } from '@/symbols/builder'
import FormSection from '@/entities/trellis/FormSection'

export default Vue.extend({
  name: 'Section',
  components: { Page, SectionHeader, ExpandSection, SortableList },
  props: {
    value: Object as PropOptions<Section>,
  },
  inject: { builder },
  data () {
    return {
      working: false,
      visible: this.value.formSections[0].sortOrder < 3,
    }
  },
  methods: {
    updateFollowUp (followUpQuestionId?: string) {
      console.log('updateFollowUp', followUpQuestionId)
      const s = this.value.formSections[0]
      s.followUpQuestionId = followUpQuestionId
      this.updateFormSection(s)
    },
    randomizeFollowUp (randomize: boolean) {
      const s = this.value.formSections[0]
      s.randomizeFollowUp = randomize
      this.updateFormSection(s)
    },
    randomizePages (randomize: boolean) {
      const s = this.value.formSections[0]
      s.randomizePages = randomize
      this.updateFormSection(s)
    },
    async updateFormSection (val: FormSection) {
      if (this.working) return
      this.working = true
      try {
        const section = await FormBuilderService.updateFormSection(val)
        const s = this.value
        s.formSections[0] = section
        this.$emit('input', s)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async addPage () {
      if (this.working) return
      this.working = true
      try {
        const page = await FormBuilderService.newQuestionGroup(this.value.id)
        const s = this.value
        page.questions = []
        page.skips = []
        console.log('added page', page)
        s.pages.push(page)
        this.$emit('input', s)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async removePage (page: QuestionGroup) {
      if (this.working) return
      this.working = true
      try {
        await FormBuilderService.removeQuestionGroup(page.id)
        const index = this.value.questionGroups.indexOf(page)
        if (index >= 0) {
          this.value.questionGroups.splice(index, 1)
          this.$emit('input', this.value)
        }
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async movedPage (e: Moved<QuestionGroup> | Added<QuestionGroup>) {
      this.working = true
      try {
        const page = e.element
        page.sectionQuestionGroup.sectionId = this.value.id
        page.sectionQuestionGroup.questionGroupOrder = e.newIndex
        await FormBuilderService.updateSectionQuestionGroup(page.sectionQuestionGroup)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
  },
  computed: {
    pageMap (): Record<string, QuestionGroup> {
      const m: Record<string, QuestionGroup> = {}
      for (const qg of this.value.questionGroups) {
        m[qg.id] = qg
      }
      return m
    },
  },
})
</script>

<style lang="sass">

.section-content
  position: relative
  .section-indicator
    position: absolute
    left: 0
    top: 0
      // top: -45px
    height: 100%
    width: 15px
    border-top: 2px solid lightgrey
    border-left: 2px solid lightgrey
      // border-bottom: 2px solid lightgrey

.theme--dark
  .section-content
    .section-indicator
      border-top: 2px solid darken(lightgrey, 50)
      border-left: 2px solid darken(lightgrey, 50)

</style>
