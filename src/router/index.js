import Vue from 'vue'
import Router from 'vue-router'
import Page from '@/components/Page'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/page/:id',
      name: 'Page',
      component: Page
    }
  ]
})

export default router
