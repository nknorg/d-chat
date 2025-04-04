import { useClientStore } from '@/stores/client'
import contact from './contact'
import chat from './chat'
import setting from './setting'
import wallet from './wallet'
import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Home',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "home" */ '@/views/chat/Home.vue')
  },
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('@/views/Signin.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      ...setting,
      ...chat,
      ...wallet,
    ]
  },
  {
    path: '/contact',
    component: () => import('@/layouts/sub/Default.vue'),
    children: [
      ...contact,
    ]
  },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const clientStore = useClientStore()
  const isLogin = clientStore.lastSignInId != null
  // const needLogin = to.meta.requiresAuth

  if (!isLogin && to.path !== '/signin') {
    next({ path: '/signin' })
  } else {
    next()
  }
})

export default router
