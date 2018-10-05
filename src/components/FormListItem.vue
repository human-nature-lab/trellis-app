<template>
  <v-card class="ma-1">
    <v-layout
      column
      :id="'form-' + form.id"
      :class="{'open': isOpen}">
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
            <span>
              {{ $t('completed') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else-if="form.isStarted">
            <v-icon
              slot="activator"
              color="orange darken-2">query_builder</v-icon>
            <span>
              {{ $t('in_progress') }}
            </span>
          </v-tooltip>
          <v-tooltip
            right
            v-else>
            <v-icon slot="activator">
              play_circle_outline
            </v-icon>
            <span>
              {{ $t('not_started') }}
            </span>
          </v-tooltip>
        </v-flex>
        <v-flex
          class="centered clickable"
          @click="$emit('click')">
          <AsyncTranslationText
            :translation="form.nameTranslation">
          </AsyncTranslationText>
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
          :data-survey-id="survey.id"
          :key="survey.id">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th class="a-left">
                  {{ $t('interviews') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="survey in form.surveys"
                :data-survey-id="survey.id"
                :key="survey.id">
                <td>
                  <span
                    v-if="survey.completedAt"
                    class="complete">
                    {{ $t('completed') }}
                  </span>
                  <span
                    v-else
                    class="incomplete">
                    {{ $t('in_progress') }}
                  </span>
                </td>
                <td>
                  <table>
                    <tr>
                      <th>{{ $t('surveyor') }}</th>
                      <th>{{ $t('start_time') }}</th>
                      <th>{{ $t('end_time') }}</th>
                    </tr>
                    <tr
                      v-for="interview in survey.interviews"
                      :data-interview-id="interview.id"
                      :key="interview.id">
                      <td>{{getName(interview.user)}} <span class="light">({{getUsername(interview.user)}})</span></td>
                      <td>{{interview.startTime}}</td>
                      <td>{{interview.endTime}}</td>
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
  // @ts-ignore
  import AsyncTranslationText from './AsyncTranslationText.vue'
  import global from '../static/singleton'

  export default {
    name: 'form-list-item',
    props: {
      form: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        global: global,
        isOpen: false
      }
    },
    computed: {
      isComplete () {
        return this.form.isComplete
      },
      isStarted () {
        return this.form.isStarted
      },
      nSurveys () {
        return this.form.surveys.length
      }
    },
    methods: {
      getName (user) {
        if (!user) return 'No user defined'
        else return user.name
      },
      getUsername (user) {
        if (!user) return ''
        else return user.username
      }
    },
    components: {
      AsyncTranslationText
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
