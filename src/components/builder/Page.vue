<template>
  <v-card class="mb-6">
    <v-card-title class="page-drag-handle">
      <span class="text-h6">
        {{$t('page', [index + 1])}}
      </span>
      <v-spacer />
      <v-chip v-if="value.skips && value.skips.length" @click="showSkips = !showSkips">
        {{$tc('skip_count', value.skips.length)}}
      </v-chip>
      <v-menu left offset-y>
        <template #activator="{ on, attrs }">
          <v-icon v-on="on" v-bind="attrs">mdi-dots-vertical</v-icon>
        </template>
        <v-list>
          <v-list-item @click="showSkips = !showSkips">
            {{$t('show_skips')}}
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-col class="px-4 pb-2">
      <draggable
        tag="div"
        class="px-4 pb-2 page-list"
        v-model="value.questions"
        handle=".question-drag-handle" 
        :group="{ name: 'questions' }"
        :animation="200">
        <Question
          v-for="(question, index) in value.questions"
          :key="question.id"
          v-model="value.questions[index]"
          :questions="questions"
          :questionTypes="questionTypes"
          :conditionTags="conditionTags"
          :locale="locale" />
      </draggable>
      <v-col v-if="showSkips">
        <v-row class="text-subheading-2" no-gutters>
          Skips
        </v-row>
        <SkipEditor 
          :skips="value.skips"
          :conditionTags="conditionTags"
          subject="page"
          :newSkip="newSkip"
          :deleteSkip="deleteSkip" />
      </v-col>
    </v-col>
  </v-card>
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
    data () {
      return {
        showSkips: false,
      }
    },
    methods: {
      async updateSkip () {

      },
      async newSkip () {

      },
      async deleteSkip () {

      }
    }
  })
</script>

<style lang="sass">
  
</style>