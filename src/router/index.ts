import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/activos' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/activos', name: 'activos', component: () => import('../views/ActivosView.vue') },
    { path: '/ordenes', name: 'ordenes', component: () => import('../views/OrdenesView.vue') },
  ],
})

export default router
