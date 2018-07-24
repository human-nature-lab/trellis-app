<template>
  <v-container fluid class="page">
    <v-layout column>
      <debug name="Location">{{location}}</debug>
      <debug :name="'Assigned Conditions: ' + conditionTags.length">
        <pre>
          <code>
            {{JSON.stringify(conditionTags, null, 2)}}
          </code>
        </pre>
      </debug>
      <debug :name="`Question Datum: ${data.length}, Datum: ${datumLength}, Cached Datum: ${datumRecyclerSize()}, Cache Question Datum: ${questionDatumRecyclerSize()}`">
        <pre>
          <code>
            {{JSON.stringify(data, null, 2)}}
          </code>
        </pre>
      </debug>
      <debug :name="'Actions: ' + actions.length">
        <pre>
          <code>
            {{JSON.stringify(actions, null, 2)}}
          </code>
        </pre>
      </debug>
      <v-flex class="page-content">
        <Question
          v-for="question in questions"
          :question="question"
          :interview="interview"
          :location="location"
          :key="question.id"/>
      </v-flex>
      <v-flex
        class="page-footer">
          <v-layout row
                    justify-space-between>
            <v-btn @click="onPrevious"
                   :disabled="isFirstPage"
                   justify-left>
              <v-icon left>chevron_left</v-icon>
              {{ $t('previous') }}
            </v-btn>
            <v-btn @click="onNext"
                   :disabled="!isNavigationEnabled"
                   justify-right>
              {{isAtEnd ? $t('finish') : $t('previous')}} <v-icon right>chevron_right</v-icon>
            </v-btn>
          </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Question from './Question.vue'
  import questionDatumRecycler from './services/recyclers/QuestionDatumRecycler'
  import datumRecycler from './services/recyclers/DatumRecycler'
  import actionBus from './services/ActionBus'
  export default {
    name: 'page',
    props: {
      questions: {
        type: Array,
        required: true
      },
      data: {
        type: Array,
        required: true
      },
      actions: {
        type: Array,
        required: true
      },
      conditionTags: {
        type: Object,
        required: true
      },
      interview: {
        type: Object,
        required: true
      },
      location: {
        type: Object,
        required: true
      },
      isAtEnd: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      onNext: function () {
        actionBus.action({
          action_type: 'next'
        })
      },
      onPrevious: function () {
        actionBus.action({
          action_type: 'previous'
        })
      },
      datumRecyclerSize: function () {
        return datumRecycler.cache.size
      },
      questionDatumRecyclerSize: function () {
        return questionDatumRecycler.cache.size
      }
    },
    computed: {
      isNavigationEnabled: function () {
        for (let question of this.questions) {
          if (!question.allParametersSatisfied) {
            return false
          }
        }
        return true
      },
      isFirstPage: function () {
        return this.location.page === 0 &&
          this.location.section === 0 &&
          this.location.sectionRepetition === 0 &&
          this.location.sectionFollowUpDatumRepetition === 0
      },
      datumLength: function () {
        let l = 0
        for (let datum of this.data) {
          l += datum.data.length
        }
        return l
      }
    },
    components: {
      Question
    }
  }
</script>

<style lang="sass">
  $btn-height: 60px
  .page
    margin-bottom: 20px
  .page-footer
    background-color: white
    box-shadow: 0 0px 10px rgba(0, 0, 0, .3)
    height: $btn-height
    position: fixed
    z-index: 100
    left: 0
    bottom: 0
    padding: 0
    margin: 0
    width: 100%
    .btn
      margin: 0
      width: 50%
      height: $btn-height
</style>
