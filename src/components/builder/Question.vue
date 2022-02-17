<template>
  <v-col class="mb-4 ml-4">
    <v-row class="secondary py-2 px-2 question-drag-handle align-center">
      <EditText v-model="value.varName" @save="updateQuestion" editable :loading="isWorking" :disabled="isWorking" />
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
        :items="builder.questionTypes" />
      <span class="pa-1 lowercase">{{$t('type')}}: {{value.questionType.name}}</span>
    </v-row>
    <v-row>
      <Translation
        v-model="value.questionTranslation"
        :locale="builder.locale"
        class="text-body-1"
        autogrow
        editable />
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Question from '../../entities/trellis/Question'
  import BuilderMixin from '../../mixins/BuilderMixin'
  import Translation from './Translation.vue'
import EditText from './EditText.vue'

  export default Vue.extend({
    name: 'Question',
    mixins: [BuilderMixin],
    components: { Translation, EditText },
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