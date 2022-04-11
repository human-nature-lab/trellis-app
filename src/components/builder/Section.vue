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
      :show-options.sync="showOptions"
    />
    <v-progress-linear
      v-if="working"
      indeterminate
    />
    <v-slide-y-transition>
      <div v-if="visible">
        <v-col class="py-0 pl-4">
          <!-- <draggable
          v-model="value.questionGroups"
          handle=".page-drag-handle"
          :group="{ name: 'pages', type: 'move' }"
          :animation="200"
          :setData="setData"
          @add="updatePage"
        @update="reorderPages">-->
          <Page
            v-for="(page, index) in value.questionGroups"
            :key="page.id"
            ref="pages"
            :index="index"
            @remove="removePage(page)"
            v-model="value.questionGroups[index]"
          />
        <!-- </draggable> -->
        </v-col>
      </div>
    </v-slide-y-transition>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import draggable, { MoveEvent } from 'vuedraggable'
import Page from './Page.vue'
import SectionHeader from './SectionHeader.vue'
import Section from '../../entities/trellis/Section'
import FormBuilderService from '../../services/builder'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import FormSection from 'src/entities/trellis/FormSection'

export default Vue.extend({
  name: 'Section',
  components: { Page, draggable, SectionHeader },
  props: {
    value: Object as PropOptions<Section>
  },
  data () {
    return {
      working: false,
      visible: this.value.formSections[0].sortOrder < 3,
      showOptions: false
    }
  },
  methods: {
    setData (data: DataTransfer, elem: HTMLElement) {
      console.log('setData', data, elem)
      const pageIndex = this.$refs.pages.findIndex(c => c.$el === elem.__vue__)
      const page: QuestionGroup = this.value.questionGroups[pageIndex].copy()
      delete page.questions
      delete page.skips
      data.setData('text/json', JSON.stringify({ questionGroup: page.toSnakeJSON() }))
    },
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
    async updatePage (event: MoveEvent<typeof Page>) {
      if (this.working) return
      this.working = true
      try {
        const data: { questionGroup: QuestionGroup } = JSON.parse(event.originalEvent.dataTransfer.getData('text/json'))
        if (!data.questionGroup) return false
        const page = new QuestionGroup().fromSnakeJSON(data.questionGroup)
        // data.questionGroup.sectionQuestionGroup[0].sectionId = page
        // data.questionGroup.sectionQuestionGroup[0]
        await FormBuilderService.updateQuestionGroup(data.questionGroup)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    async reorderPages (event: { originalEvent: DragEvent, fromIndex: number, toIndex: number }) {
      console.log('reorderPages', event)
      if (this.working) return
      const a = this.value.questionGroups[event.fromIndex]
      const b = this.value.questionGroups[event.toIndex]
      try {
        a.sectionQuestionGroup.questionGroupOrder = b.sectionQuestionGroup.questionGroupOrder
        b.sectionQuestionGroup.questionGroupOrder = a.sectionQuestionGroup.questionGroupOrder
        a.sectionQuestionGroup = await FormBuilderService.updateSectionQuestionGroup(a.sectionQuestionGroup)
        b.sectionQuestionGroup = await FormBuilderService.updateSectionQuestionGroup(b.sectionQuestionGroup)
      } catch (err) {
        this.log(err)
      }
    }
  },
  computed: {
    pageMap (): Record<string, QuestionGroup> {
      const m: Record<string, QuestionGroup> = {}
      for (const qg of this.value.questionGroups) {
        m[qg.id] = qg
      }
      return m
    }
  }
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
</style>
