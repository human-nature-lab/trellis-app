<template>
  <v-card class="ma-1">
    <v-layout
      column
      :class="{open: isOpen}"
      :data-id="form.id">
      <v-layout
        row>
        <v-flex class="centered icon-container clickable"
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
          class="centered clickable"
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
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th class="a-left">Interviews</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="survey in form.surveys" :key="survey.id">
                <td>
                  <span
                    v-if="survey.completed_at"
                    class="complete">
                    Completed at: {{survey.completed_at}}
                  </span>
                  <span
                    v-else
                    class="incomplete">
                    Incomplete
                  </span>
                </td>
                <td>
                  <table>
                    <tr>
                      <th>Surveyor</th>
                      <th>Start time</th>
                      <th>End time</th>
                    </tr>
                    <tr
                      v-for="interview in survey.interviews"
                      :key="interview.id">
                      <td>{{interview.user.name}} <span class="light">({{interview.user.username}})</span></td>
                      <td>{{interview.start_time}}</td>
                      <td>{{interview.end_time}}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
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
  table
    thead
      th
        border-bottom: 1px solid grey
    width: 100%
    td, th
      text-align: right
      &:first-child
        text-align: left
    .a-left
      text-align: left
  .icon-container
    width: 50px
    padding: 5px
    flex-grow: 0
    flex-shrink: 0
  /*.open*/
    /*border-top: 1px solid lightgrey*/
    /*border-bottom: 1px solid lightgrey*/
  .light
    color: grey
  .clickable
    cursor: pointer
  .complete
    color: green
  .incomplete
    color: orangered
  .centered
    display: inline-flex
    align-items: center

</style>
