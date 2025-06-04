import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  // You can add more pages like /payments or /history later
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
