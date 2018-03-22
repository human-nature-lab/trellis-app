import Vue from 'vue'
import Router from 'vue-router'
import Interview from '@/components/interview/Interview'
import Home from '@/components/Home'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/interview/:id',
      name: 'Interview',
      component: Interview
    }, {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})

export default router
