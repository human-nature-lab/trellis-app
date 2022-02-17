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
          :disabled="disabled"
          :question="question"
          :interview="interview"
          :location="location"
          :key="question.id"/>
      </v-flex>
      <v-col class="page-footer">
          <v-row no-gutter>
            <v-col>
              <v-btn @click="onPrevious"
                :disabled="disabled"
                justify-left>
                <TrellisLoadingCircle v-show="prevActive" size="30px" margin="0 8px" />
                <v-icon left v-show="!prevActive">mdi-chevron-left</v-icon>
                {{isAtBeginning ? $t('exit') : $t('previous')}}
              </v-btn>
            </v-col>
            <v-col>
              <v-btn @click="onNext"
                :disabled="!isNavigationEnabled || disabled"
                justify-right>
                {{isAtEnd ? $t('finish') : $t('next')}}
                <TrellisLoadingCircle v-show="nextActive" size="30px" margin="0 8px" />
                <v-icon right v-show="!nextActive">mdi-chevron-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
      </v-col>
    </v-layout>
  </v-container>
</template>

<script>
  import Question from './Question.vue'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import questionDatumRecycler from './services/recyclers/QuestionDatumRecycler'
  import datumRecycler from './services/recyclers/DatumRecycler'
  import ActionMixin from './mixins/ActionMixin'
  import AT from '../../static/action.types'
  export default {
    name: 'page',
    mixins: [ActionMixin],
    data () {
      return {
        nextWorking: false,
        prevWorking: false
      }
    },
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
      },
      isAtBeginning: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      nextActive: {
        type: Boolean,
        default: false
      },
      prevActive: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      onNext () {
        this.actionWithoutQuestion(AT.next)
      },
      onPrevious () {
        this.actionWithoutQuestion(AT.previous)
      },
      datumRecyclerSize () {
        return datumRecycler.cache.size
      },
      questionDatumRecyclerSize () {
        return questionDatumRecycler.cache.size
      }
    },
    computed: {
      isNavigationEnabled () {
        for (let question of this.questions) {
          if (!question.allParametersSatisfied) {
            return false
          }
        }
        return true
      },
      datumLength () {
        let l = 0
        for (let datum of this.data) {
          l += datum.data.length
        }
        return l
      }
    },
    components: {
      Question,
      TrellisLoadingCircle
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
    .v-btn
      margin: 0
      width: 100%
      height: $btn-height !important
</style>
