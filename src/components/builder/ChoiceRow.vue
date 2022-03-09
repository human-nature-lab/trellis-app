<template>
  <v-row no-gutters class="align-center">
    <v-col cols="1">
      <v-text-field v-model="value.choice.val" :readonly="disabled" @change="update" :loading="working" />
    </v-col>
    <v-col cols="10">
      <Translation
        v-model="value.choice.choiceTranslation"
        :disabled="disabled"
        :loading="working"
        editable
        :locale="locale"
      />
    </v-col>
    <v-col cols="1">
      <DotsMenu>
        <v-list>
          <v-list-item @click="$emit('remove')">
            <v-list-item-action>
              <v-icon>mdi-delete</v-icon>
            </v-list-item-action>
            <v-list-item-content>{{ $t('delete') }}</v-list-item-content>
          </v-list-item>
        </v-list>
      </DotsMenu>
    </v-col>
  </v-row>
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
    disabled: Boolean,
  },
  data() {
    return {
      working: false
    };
  },
  methods: {
    async update() {
      this.working = true;
      try {
        await builder.updateQuestionChoice(this.value);
        this.$emit("input", this.value);
      }
      finally {
        this.working = false;
      }
    },
  },
  components: { DotsMenu, Translation }
})
</script>

<style lang="sass">

</style>