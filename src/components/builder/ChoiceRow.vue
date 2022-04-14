<template>
  <v-col class="px-0">
    <v-row
      no-gutters
      class="align-end"
    >
      <v-col
        cols="2"
        class="px-0"
      >
        <v-text-field
          v-model="value.choice.val"
          :readonly="busy || disabled"
          @change="update"
          :label="$t('value')"
          hide-details
          dense
        />
      </v-col>
      <Translation
        cols="9"
        :value="value.choice.choiceTranslation"
        @input="onInput"
        :disabled="disabled"
        editable
        :locale="locale"
      />
      <v-col
        cols="1"
        class="px-0 text-right"
      >
        <DotsMenu
          :disabled="disabled"
          removable
          @remove="$emit('remove')"
          :loading="loading || working"
        />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import TranslationEntity from '../../entities/trellis/Translation'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'
import Translation from './Translation.vue'

export default Vue.extend({
  name: 'ChoiceRow',
  props: {
    value: Object as PropType<QuestionChoice>,
    locale: Object as PropType<Locale>,
    loading: Boolean,
    disabled: Boolean,
  },
  data () {
    return {
      working: false,
    }
  },
  methods: {
    async update () {
      this.working = true
      try {
        await builder.updateChoice({ questionChoiceId: this.value.id, val: this.value.choice.val })
        this.$emit('input', this.value)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
    onInput (t: TranslationEntity) {
      const v = this.value
      v.choice.choiceTranslation = t
      this.$emit('input', v)
    },
  },
  computed: {
    busy (): boolean {
      return this.working || this.loading
    },
  },
  components: { DotsMenu, Translation },
})
</script>
