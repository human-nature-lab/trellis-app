<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <v-col cols="1">
        <v-text-field
          v-model="value.choice.val"
          :readonly="busy || disabled"
          @change="update"
          :label="$t('value')"
          hide-details
        />
      </v-col>
      <v-col cols="10">
        <Translation
          v-model="value.choice.choiceTranslation"
          :disabled="disabled"
          editable
          :locale="locale"
        />
      </v-col>
      <v-col cols="1" class="text-right">
        <DotsMenu :disabled="disabled" removable @remove="$emit('remove')" />
      </v-col>
    </v-row>
    <v-progress-linear v-if="busy" indeterminate />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'
import Translation from './Translation.vue'

export default Vue.extend({
  name: "ChoiceRow",
  props: {
    value: Object as PropType<QuestionChoice>,
    locale: Object as PropType<Locale>,
    loading: Boolean,
    disabled: Boolean,
  },
  data() {
    return {
      working: false
    }
  },
  methods: {
    async update() {
      this.working = true;
      try {
        await builder.updateQuestionChoice({ questionChoiceId: this.value.id, val: this.value.choice.val });
        this.$emit("input", this.value);
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false;
      }
    },
  },
  computed: {
    busy(): boolean {
      return this.working || this.loading
    }
  },
  components: { DotsMenu, Translation }
})
</script>
