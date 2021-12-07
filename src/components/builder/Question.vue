<template>
  <v-col class="mb-4">
    <v-row class="secondary py-2 px-2 question-drag-handle">
      <span class="text-subtitle-1">{{value.varName}}</span>
      <v-spacer />
      <v-chip v-if="value.assignConditionTags && value.assignConditionTags.length" color="primary" label>
        {{$t('assigns_condition_tags', ['"' + value.assignConditionTags.map(act => act.conditionTag.name).join('","') + '"'])}}
      </v-chip>
      <v-autocomplete
        v-model="value.questionTypeId"
        single-line
        dense
        :disabled="isWorking"
        @change="updateQuestion"
        item-value="id"
        item-text="name"
        :items="questionTypes" />
      <span class="pa-1 lowercase">{{$t('type')}}: {{value.questionType.name}}</span>
    </v-row>
    <v-row>
      <Translation
        v-model="value.questionTranslation"
        :locale="locale"
        class="text-body-1"
        editable />
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Question from '../../entities/trellis/Question'
  import BuilderMixin from '../../mixins/BuilderMixin'
  import Translation from './Translation.vue'

  export default Vue.extend({
    name: 'Question',
    mixins: [BuilderMixin],
    components: { Translation },
    props: {
      value: Object as PropOptions<Question>,
    },
    data () {
      return {
        isWorking: false,
      }
    },
    methods: {
      async updateQuestion () {
        this.isWorking = true
        try {

        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass">
  .lowercase
    text-transform: lowercase
</style>