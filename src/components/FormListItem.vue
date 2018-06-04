<template>
  <v-card class="ma-2">
    <v-layout
      column
      :class="{open: isOpen}"
      :data-id="form.id">
      <v-layout
        row>
        <v-flex class="pa-3 icon-container clickable"
                @click="$emit('click')">
          <v-tooltip
            right
            v-if="form.isComplete">
            <v-icon
              slot="activator"
              color="green darken-2">check_circle</v-icon>
            <span>Complete</span>
          </v-tooltip>
          <v-tooltip
            right
            v-else-if="form.isStarted">
            <v-icon
              slot="activator"
              color="orange darken-2">query_builder</v-icon>
            <span>Started</span>
          </v-tooltip>
          <v-tooltip
            right
            v-else>
            <v-icon slot="activator">
              play_circle_outline
            </v-icon>
            <span>Not started</span>
          </v-tooltip>
        </v-flex>
        <v-flex
          class="pa-3 clickable"
          @click="$emit('click')">
          <TranslatedText
            :translation="form.name_translation"
            :locale="global.locale"/>
        </v-flex>
        <v-spacer />
        <v-flex class="icon-container">
          <v-btn
            :disabled="!form.surveys.length"
            icon
            @click="isOpen = !isOpen">
            <v-icon v-if="!isOpen">keyboard_arrow_down</v-icon>
            <v-icon v-else>keyboard_arrow_up</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout
        column
        class="ml-5"
        v-show="isOpen">
        <v-flex
          v-for="survey in form.surveys"
          :key="survey.id">
          <v-layout row wrap>
            <v-flex>
              Survey completed at: {{survey.completed_at}}
            </v-flex>
          </v-layout>
          <v-layout
            class="ml-5"
            column>
            <v-flex>Interviews</v-flex>
            <v-layout
              v-for="interview in survey.interviews"
              :key="interview.id">
              <v-flex>
                {{interview.start_time}}
              </v-flex>
              <v-flex>
                {{interview.end_time}}
              </v-flex>
              <v-flex>
                {{interview.user.name}} <span class="light">({{interview.user.username}})</span>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-card>
</template>

<script>
  import TranslatedText from './TranslatedText'
  export default {
    name: 'form-list-item',
    props: {
      form: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        isOpen: false,
        isComplete: this.form.isComplete,
        isStarted: this.form.isStarted,
        nSurveys: this.form.nSurveys,
        completedSurveys: this.form.completedSurveys
      }
    },
    components: {
      TranslatedText
    }
  }
</script>

<style lang="sass" scoped>
  .icon-container
    width: 40px
    flex-grow: 0
    flex-shrink: 0
  /*.open*/
    /*border-top: 1px solid lightgrey*/
    /*border-bottom: 1px solid lightgrey*/
  .light
    color: grey
  .clickable
    cursor: pointer
</style>
