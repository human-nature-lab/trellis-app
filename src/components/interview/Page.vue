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
                   :disabled="isFirstPage || prevWorking"
                   justify-left>
              <v-icon left>chevron_left</v-icon>
              {{ $t('previous') }}
            </v-btn>
            <v-btn @click="onNext"
                   :disabled="!isNavigationEnabled || nextWorking"
                   justify-right>
              {{isAtEnd ? $t('finish') : $t('next')}} <v-icon right>chevron_right</v-icon>
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
      }
    },
    methods: {
      onNext () {
        if (this.nextWorking) {
          console.log('double press next')
          return
        }
        console.log('next click')
        this.nextWorking = true
        setTimeout(() => {
          console.log('next eval', this.nextWorking)
          this.actionWithoutQuestion(AT.next)
          setTimeout(() => {
            this.nextWorking = false
            console.log('resetting next', this.nextWorking)
          })
        })
      },
      onPrevious () {
        if (this.prevWorking) return
        this.prevWorking = true
        setTimeout(() => {
          this.actionWithoutQuestion(AT.previous)
          setTimeout(() => {
            this.prevWorking = false
          })
        })
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
      isFirstPage () {
        return this.location.page === 0 &&
          this.location.section === 0 &&
          this.location.sectionRepetition === 0 &&
          this.location.sectionFollowUpDatumRepetition === 0
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
