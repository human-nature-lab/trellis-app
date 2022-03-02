<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <h4>{{ $t('choices') }}</h4>
      <v-spacer />
      <v-tooltip v-if="!disabled" left>
        <template #activator="{ on, attrs }">
          <v-btn @click="add" text icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_choice') }}
      </v-tooltip>
    </v-row>
    <v-list>
      <v-list-item v-for="choice in value" :key="choice.id">
        <v-row no-gutters class="align-center">
          <v-col cols="1">
            <v-text-field v-model="choice.choice.val" :readonly="disabled" />
          </v-col>
          <v-col cols="10">
            <Translation
              v-model="choice.choice.choiceTranslation"
              :disabled="disabled"
              editable
              :locale="locale"
            />
          </v-col>
          <v-col cols="1">
            <DotsMenu>
              <v-list>
                <v-list-item @click="remove(choice)">
                  <v-list-item-action>
                    <v-icon>mdi-delete</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>{{ $t('delete') }}</v-list-item-content>
                </v-list-item>
              </v-list>
            </DotsMenu>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import Translation from './Translation.vue'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  props: {
    disabled: Boolean,
    locale: Object as PropType<Locale>,
    questionId: String,
    value: Array as PropType<QuestionChoice[]>,
  },
  methods: {
    async add() {
      const choice = await builder.createQuestionChoice(this.questionId)
      debugger
      this.$emit('input', this.value.concat(choice))
    },
    async remove(choice: QuestionChoice) {
      await builder.removeQuestionChoice(choice)
      const index = this.value.indexOf(choice)
      this.$emit('input', this.value.slice(0, index).concat(this.value.slice(index + 1)))
    },
  },
  components: { Translation, DotsMenu }
})

</script>