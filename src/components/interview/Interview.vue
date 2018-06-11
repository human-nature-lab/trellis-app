<template>
  <v-flex>
    <Page :questions="questions"
          :location="location"
          :actions="interviewActions"
          :data="interviewData"
          :conditionTags="interviewConditionTags"
          :interview="interview"/>
    <v-dialog
      v-model="dialog.beginning">
      <v-card>
        <v-card-title class="headline">
          You've reached the beginning of the survey
        </v-card-title>
        <v-card-text>
          All changes have been saved. Would you like to exit the interview?
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="dialog.beginning = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="saveAndExit">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog.end">
      <v-card>
        <v-card-title class="headline">
          You've reached the end of the survey
        </v-card-title>
        <v-card-text>
          Would you like to exit and permanently lock the survey?
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="dialog.end = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="lockAndExit()">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-touch="{down: () => dialog.conditionTag = false}"
      content-class="condition-tag-dialog"
      transition="dialog-bottom-transition"
      scrollable
      full-width
      lazy
      v-model="dialog.conditionTag">
      <v-card tile>
        <v-toolbar
          card
          dark
          color="primary">
          <v-btn icon dark @click.native="dialog.conditionTag = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Conditions</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <ConditionTagList :conditions="interviewConditionTags" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import Page from './Page'
  import ConditionTagList from './ConditionTagList'
  import menuBus from '../main-menu/MenuBus'

  import {sharedInterview, clearSharedInterview} from './models/Interview'

  import InterviewService from '../../services/interview/InterviewService'
  import actionBus from './services/ActionBus'
  import InterviewActionsService from './services/interview-actions/InterviewActionsService'
  import FormService from '../../services/form/FormService'
  import LocaleService from '../../services/locale/LocaleService'
  import {validateParametersWithError} from './services/ValidatorService'

  import router from '../../router/router'
  import singleton from '../../singleton'

  let interviewData = {}

  function loadInterview (interviewId) {
    let interview
    singleton.loading.message = 'Loading interview and survey'
    return InterviewService.getInterview(interviewId)
      .catch(err => {
        console.error('No interview exists with this id')
        throw err
      })
      .then(inter => {
        interview = inter
        singleton.loading.step++
        singleton.loading.message = 'Loading existing data and stuff'
        return Promise.all([
          InterviewActionsService.getActions(interviewId).then(r => {
            singleton.loading.step++
            return r
          }).catch(() => {
            // throw new Error('Could not contact interview actions service: ' + err)
          }),
          InterviewService.getData(interviewId).then(r => {
            singleton.loading.step++
            return r
          }).catch(() => {
            // throw new Error('Could not contact interview data service: ' + err)
          }),
          FormService.getForm(interview.survey.form_id).then(r => {
            singleton.loading.step++
            return r
          }),
          InterviewService.getPreload(interviewId).then(r => {
            singleton.loading.step++
            return r
          }).catch(() => {
            // throw new Error('Could not contact preload data service: ' + err)
          })
        ]).then(results => {
          let [actions, data, formBlueprint, preload] = results
          for (let d of data.data) {
            for (let datum of d.data) {
              for (let key in datum) {
                if (datum[key] === null || datum[key] === undefined) {
                  delete datum[key]
                }
              }
            }
          }
          interviewData.conditionTags = data.conditionTags || {}
          interviewData.interview = interview
          interviewData.actions = actions || []
          interviewData.data = data.data || []
          interviewData.form = formBlueprint
          interviewData.preload = preload
        }).catch((err) => {
          console.error(err)
        })
      })
  }

  function loadPreview (formId) {
    let promises = [
      FormService.getForm(formId).then(form => {
        interviewData.form = form
        singleton.loading.step++
      })
    ]
    return Promise.all(promises)
  }

  function interviewGuards (to, from, next) {
    singleton.loading.active = true
    singleton.loading.step = 0
    singleton.loading.steps = 0
    singleton.loading.indeterminate = false
    LocaleService.setExistingLocale()
    let p
    if (to.name === 'Interview') {
      interviewData.interviewType = 'interview'
      p = loadInterview(to.params.interviewId)
      singleton.loading.steps += 4
    } else {
      interviewData.interviewType = 'preview'
      p = loadPreview(to.params.formId)
      singleton.loading.steps++
    }
    if (to.query.locale) {
      singleton.loading.steps++
      p.then(() => {
        singleton.loading.message = 'Loading current locale'
        return LocaleService.getLocaleById(to.query.locale)
          .then(locale => {
            singleton.loading.step++
            LocaleService.setCurrentLocale(locale)
          })
          .catch(err => {
            console.error('no locale matching', to.query.locale, 'in the database')
            console.error(err)
          })
      })
    }
    return p.then(() => {
      singleton.loading.step++
      singleton.loading.active = false
    }).then(next)
  }

  let interviewState
  export default {
    name: 'interview',
    head: {
      title: function () {
        let d = {}
        if (this.type === 'preview') {
          d.inner = 'Form preview: ' + interviewState.blueprint.id
        } else if (this.interview.survey) {
          d.inner = `Interview with ${this.interview.survey.respondent.name}`
        }
        return d
      }
    },
    data () {
      return {
        artificiallyExtendLoadTime: false,
        formId: null,
        surveyId: null,
        clipped: false,
        isLoading: true,
        type: 'interview',
        interviewData: {},
        interviewActions: {},
        interviewConditionTags: {},
        interview: {},
        location: {
          section: 0,
          page: 0,
          sectionRepetition: 0,
          sectionFollowUpDatumRepetition: null,
          sectionFollowUpDatumId: null
        },
        dialog: {
          beginning: false,
          end: false,
          conditionTag: false
        },
        loadingStep: 0
      }
    },
    created () {
      this.loadInterview()
      actionBus.$on('action', this.actionHandler)
      menuBus.$on('showConditionTags', this.showConditionTags)
      window.onbeforeunload = this.prematureExit
    },
    beforeDestroy: function () {
      window.onbeforeunload = null
      menuBus.$off('showConditionTags', this.showConditionTags)
      actionBus.$off('action', this.actionHandler)
      interviewState.destroy()
    },
    beforeRouteEnter (to, from, next) {
      console.log('before route enter', to)
      interviewGuards(to, from, next)
    },
    beforeRouteUpdate (to, from, next) {
      console.log('before route update', to)
      this.isLoading = true
      interviewData.intervew = null
      interviewData.actions = null
      interviewData.data = null
      interviewData.form = null
      interviewData.preload = null
      interviewGuards(to, from, next).then(() => {
        this.loadInterview()
      })
    },
    beforeRouteLeave  (to, from, next) {
      console.log('before route leave', to)
      if (to.name === 'Interview' || to.name === 'InterviewPreview') {
        this.isLoading = true
        interviewData.intervew = null
        interviewData.actions = null
        interviewData.data = null
        interviewData.form = null
        interviewData.preload = null
        interviewGuards(to, from, next).then(() => {
          this.loadInterview()
        })
      } else {
        next()
      }
    },
    methods: {
      loadInterview: function () {
        this.isLoading = false
        let conditionTags = interviewData.conditionTags
        let interview = interviewData.interview
        let actions = interviewData.actions
        let form = interviewData.form
        let data = interviewData.data
        let preload = []
        if (!interview) {
          interview = {
            id: 'fake id',
            survey: {
              respondent_id: 'ok'
            }
          }
        } else {
          InterviewService.setInterviewId(interview.id)
        }
        this.type = interviewData.interviewType
        this.initializeInterview(interview, actions, data, conditionTags, form, preload)
      },
      initializeInterview: function (interview, actions, data, conditionTags, formBlueprint, preload) {
        clearSharedInterview()
        interviewState = sharedInterview(interview, formBlueprint, actions, data, conditionTags)
        if (interviewData.interviewType === 'interview') {
          interviewState.attachDataPersistSlave()
          interviewState.attachActionsPersistSlave()
        }
        // Share the relevant parts of the interview with the view
        this.interviewData = interviewState.data.data
        this.interviewConditionTags = interviewState.data.conditionTags
        this.interviewActions = interviewState.actions.store
        this.location = interviewState.navigator.location
        this.interview = interview
        interviewState.on('atEnd', this.showEndDialog, this)
        interviewState.on('atBeginning', this.showBeginningDialog, this)
        setTimeout(() => {
          this.isLoading = false
        }, this.artificiallyExtendLoadTime ? 2000 : 0)
      },
      actionHandler: function (action) {
        if (!interviewState) {
          throw Error('Trying to push actions before interview has been initialized')
        }
        interviewState.pushAction(action)
      },
      showBeginningDialog: function () {
        this.dialog.beginning = true
      },
      showEndDialog: function () {
        this.dialog.end = true
      },
      showConditionTags: function () {
        this.dialog.conditionTag = true
      },
      lockAndExit: function () {
        console.log('TODO: Make sure everything is saved before marking the survey complete and exiting')
        console.log('TODO: Lock and exit the survey')
        InterviewService.complete(this.interview.id).then(res => {
          this.dialog.end = false
          router.go(-1)
          // router.push({name: 'home'})
        })
      },
      saveAndExit: function () {
        console.log('TODO: Make sure everything is saved before exiting')
        this.dialog.end = false
        router.go(-1)
        // router.push({name: 'home'})
      },
      prematureExit: function (e) {
        const dialogText = 'You have unsaved changes. Are you sure you want to leave?'
        e.returnValue = dialogText
        return dialogText
      }
    },
    computed: {
      questions: function () {
        // The reference to this.location needs to be here so that we have a dependency on this.location
        let questions = interviewState.getPageQuestions(this.location.sectionFollowUpDatumId).map(q => {
          q.type = {
            name: q.question_type.name
          }
          let validation = validateParametersWithError(q, q.question_parameters, q.datum)
          q.allParametersSatisfied = validation === true // Makes none boolean types falsey
          q.validationError = typeof validation === 'string' ? validation : null
          q.isAnswered = false
          return q
        })
        return questions || []
      }
    },
    components: {
      Page,
      ConditionTagList
    }
  }
</script>

<style lang="sass">
  .condition-tag-dialog
    max-height: 80%
    min-height: 50%
    position: absolute
    bottom: 0
    left: 0
    padding: 0
    margin: 0
    background-color: white
</style>
