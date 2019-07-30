<template>
  <v-alert type="error" :value="errors.length">
    <v-layout>
      <v-flex>{{$t('form_has_condition_errors')}}</v-flex>
      <v-btn @click="showErrors = true">{{$t('view')}}</v-btn>
    </v-layout>
    <TrellisModal v-model="showErrors" :title="$t('condition_assignment_errors')">
      <v-expansion-panel>
        <v-expansion-panel-content v-for="err of errors">
          <v-layout slot="header">
            <v-flex>{{err.error.name}}</v-flex>
            <v-flex>message: {{err.error.message}}</v-flex>
            <v-flex>section: {{err.section}}</v-flex>
            <v-flex>page: {{err.page}}</v-flex>
          </v-layout>
          <v-container>
            <v-layout column>
              <v-layout>
                <v-flex sm1>Logic:</v-flex>
                <v-flex sm11>
                  <pre>
                    <code>{{err.logic.trim()}}</code>
                  </pre>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex sm1>Stack:</v-flex>
                <v-flex sm11>
                  <pre>
                    <code>{{err.error.stack.trim()}}</code>
                  </pre>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </TrellisModal>
  </v-alert>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisModal from '../TrellisModal.vue'
  import { ConditionAssignmentError } from './classes/ConditionAssignmentError'

  export default Vue.extend({
    name: 'ConditionAssignmentErrors',
    components: { TrellisModal },
    props: {
      errors: {
        type: Array as () => ConditionAssignmentError[],
        required: true
      }
    },
    data () {
      return {
        showErrors: false
      }
    }
  })
</script>

<style lang="sass" scoped>

</style>
