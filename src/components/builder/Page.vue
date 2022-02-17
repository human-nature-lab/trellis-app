<template>
  <v-col class="mb-6 ml-4">
    <v-row no-gutters class="page-drag-handle align-center">
      <v-card-title>
        <span class="text-h6">{{ $t('page', [index + 1]) }}</span>
      </v-card-title>
      <v-spacer />
      <v-chip
        v-if="value.skips"
        @click="showSkips = !showSkips"
      >{{ $tc('skip_count', value.skips.length) }}</v-chip>
      <v-menu left offset-y>
        <template #activator="{ on, attrs }">
          <v-icon v-on="on" v-bind="attrs">mdi-dots-vertical</v-icon>
        </template>
        <v-list>
          <v-list-item @click="showSkips = !showSkips">{{ $t('show_skips') }}</v-list-item>
        </v-list>
      </v-menu>
    </v-row>

    <v-col class="px-4 pb-2">
      <!-- <draggable
        tag="div"
        class="px-4 pb-2 page-list"
        v-model="value.questions"
        handle=".question-drag-handle" 
        :group="{ name: 'questions' }"
      :animation="200">-->
      <Question
        v-for="(question, index) in value.questions"
        :key="question.id"
        v-model="value.questions[index]"
      />
      <!-- </draggable> -->
      <v-slide-y-transition>
        <v-col v-if="showSkips">
          <v-row class="text-subheading-2" no-gutters>{{ $t('skips') }}</v-row>
          <SkipEditor
            :skips="value.skips"
            :conditionTags="builder.conditionTags"
            subject="page"
            :newSkip="newSkip"
            :deleteSkip="deleteSkip"
          />
        </v-col>
      </v-slide-y-transition>
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import Question from './Question.vue'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import draggable from 'vuedraggable'
import SkipEditor from '../skips/SkipEditor.vue'
import BuilderMixin from '../../mixins/BuilderMixin'

export default Vue.extend({
  name: 'Page',
  mixins: [BuilderMixin],
  components: { Question, draggable, SkipEditor },
  props: {
    value: Object as PropOptions<QuestionGroup>,
    index: Number,
  },
  data() {
    return {
      showSkips: false,
    }
  },
  methods: {
    async updateSkip() {

    },
    async newSkip() {

    },
    async deleteSkip() {

    }
  }
})
</script>

<style lang="sass">

</style>