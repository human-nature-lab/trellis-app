<template>
  <v-col class="section-content mb-8">
    <div class="section-indicator" />
    <SectionHeader :section="value" @addPage="addPage" />
    <div class="">
      <v-col class="pl-4">
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
          v-model="value.questionGroups[index]"
        />
        <!-- </draggable> -->
      </v-col>
    </div>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import draggable, { MoveEvent } from "vuedraggable";
import Page from './Page.vue'
import Translation from './Translation.vue'
import SectionHeader from './SectionHeader.vue'
import Section from '../../entities/trellis/Section'
import FormBuilderService from '../../services/builder'
import QuestionGroup from '../../entities/trellis/QuestionGroup';
import TCard from '../styles/TCard.vue';

export default Vue.extend({
  name: 'Section',
  components: { Translation, Page, draggable, SectionHeader, TCard },
  props: {
    value: Object as PropOptions<Section>,
  },
  data() {
    return {
      isBusy: false,
    }
  },
  methods: {
    setData(data: DataTransfer, elem: HTMLElement) {
      console.log('setData', data, elem)
      const pageIndex = this.$refs.pages.findIndex(c => c.$el === elem.__vue__)
      console.log(pageIndex)
      const page: QuestionGroup = this.value.questionGroups[pageIndex].copy()
      delete page.questions
      delete page.skips
      data.setData('text/json', JSON.stringify({ questionGroup: page.toSnakeJSON() }))
    },
    addPage() {

    },
    async updatePage(event: MoveEvent<typeof Page>) {
      const data: { questionGroup: QuestionGroup } = JSON.parse(event.originalEvent.dataTransfer.getData('text/json'))
      if (!data.questionGroup) return false
      const page = new QuestionGroup().fromSnakeJSON(data.questionGroup)
      console.log('updatePage', data.questionGroup)
      data.questionGroup.sectionQuestionGroup[0].sectionId = page
      data.questionGroup.sectionQuestionGroup[0]
      await FormBuilderService.updateQuestionGroup(data.questionGroup)
    },
    async reorderPages(event: { originalEvent: DragEvent, fromIndex: number, toIndex: number }) {
      console.log('reorderPages', event)
      if (this.isBusy) return
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
    pageMap(): Record<string, QuestionGroup> {
      const m: Record<string, QuestionGroup> = {}
      for (const qg of this.value.questionGroups) {
        m[qg.id] = qg
      }
      return m
    },
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