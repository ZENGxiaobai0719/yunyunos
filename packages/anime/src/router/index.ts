import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'seasonal',
    component: () => import('@/pages/SeasonalChart.vue'),
  },
  {
    path: '/:season-:year(\\d+)',
    name: 'season',
    component: () => import('@/pages/SeasonalChart.vue'),
    props: true,
  },
  {
    path: '/airing',
    name: 'airing',
    component: () => import('@/pages/AiringSchedule.vue'),
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/pages/ArchiveView.vue'),
  },
  {
    path: '/tba',
    name: 'tba',
    component: () => import('@/pages/TbaView.vue'),
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('@/pages/Detail.vue'),
  },
  {
    path: '/play/:animeId/:episode',
    name: 'play',
    component: () => import('@/pages/Play.vue'),
  },
  {
    path: '/admin/music',
    name: 'adminMusic',
    component: () => import('@/pages/AdminMusic.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export default createRouter({
  history: createWebHistory('/anime/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
