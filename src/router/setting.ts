export default [
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/setting/Settings.vue'),
    meta: {
      title: 'settings'
    }
  }
]
