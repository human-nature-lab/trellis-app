import Vue from 'vue'
import Router from 'vue-router'
import Interview from '@/components/interview/Interview'
import Home from '@/components/Home'
import RespondentForms from '@/components/RespondentForms'
import RespondentsSearch from '@/components/RespondentsSearch'
import QuestionExamples from '@/components/interview/QuestionExamples'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/study/:studyId/interview/:interviewId',
      name: 'Interview',
      component: Interview
    }, {
      path: '/study/:studyId/respondent/:respondentId/forms',
      name: 'RespondentForms',
      component: RespondentForms
    }, {
      path: '/',
      name: 'Home',
      component: Home
    }, {
      path: '/search/respondents',
      name: 'RespondentsSearch',
      component: RespondentsSearch
    }, {
      path: '/question/examples',
      name: 'QuestionExamples',
      component: QuestionExamples
    }
  ]
})

export default router
