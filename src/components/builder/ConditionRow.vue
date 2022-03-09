<template>
  <v-row no-gutters class="align-center text-center">
    <v-col cols="1">{{$t('assigns')}}</v-col>
    <v-col cols="2">
      <v-combobox
        class="mx-1"
        :value="value.conditionTag"
        :readonly="disabled"
        :items="conditionTags"
        @change="updateConditionTag"
      />
    </v-col>
    <v-col cols="1">{{$t('to_the') }}</v-col>
    <v-col cols="1">
      <MenuSelect v-model="value.scope" :items="scopes" @change="update" />
    </v-col>
    <v-col cols="2" class="text-center">{{ $t('if') }}</v-col>
    <v-col cols="4">
      <EditText
        outlined
        class="mx-1"
        editable
        :locked="disabled"
        code
        auto-grow
        textarea
        v-model="value.logic"
        @change="update"
      />
    </v-col>
    <v-col cols="1" class="text-right">
      <DotsMenu>
        <v-list>
          <v-list-item @click="$emit('delete')">
            <v-list-item-icon>
              <v-icon>mdi-delete</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              {{$t('delete')}}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </DotsMenu>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import type AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import MenuSelect from './MenuSelect.vue'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  name: "ConditionRow",
  props: {
    value: Object as PropType<AssignConditionTag>,
    conditionTags: Array as PropType<ConditionTag[]>,
    disabled: Boolean,
  },
  data() {
    return {
      working: false,
      scopes: ['respondent', 'form', 'section'],
    }
  },
  components: { EditText, MenuSelect, DotsMenu },
  methods: {
    async updateConditionTag(newVal: string | ConditionTag) {
      if (this.working) return
      if (typeof newVal === 'string') {
        try {
           this.working = true
           this.$emit('input', await builder.createConditionTag(newVal))
        } finally {
          this.working = false
        }
      } else {
        this.update()
      }
    },
    async update () {
      console.log('update', arguments)
      this.$emit('input', this.value)
    }
  }
})
</script>

<style lang="sass">

</style>