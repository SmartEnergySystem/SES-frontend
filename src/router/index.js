import { createRouter, createWebHashHistory } from 'vue-router'
import LoginComponent from '../views/Login.vue' // 静态导入登录页，因为通常是第一个页面

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginComponent
  },
  {
    path: '/',
    name: 'Dashboard',
    // 路由懒加载 Dashboard 组件
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
    redirect: '/realtime', // 默认子路由
    children: [
      {
        path: 'realtime',
        name: 'RealtimeMonitor',
        component: () => import('../components/RealtimeMonitor.vue')
      },
      {
        path: 'history',
        name: 'HistoryAnalyzer',
        component: () => import('../components/HistoryAnalyzer.vue')
      },
      {
        path: 'policies',
        name: 'PolicyManager',
        component: () => import('../components/PolicyManager.vue')
      },
      {
        path: 'alerts',
        name: 'AlertManager',
        component: () => import('../components/AlertManager.vue')
      }
      // 如果有用户管理等其他模块，在这里添加
    ]
  },
  // 可以添加一个 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue') // 假设你创建了一个 NotFound.vue
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL), // 使用 Hash 模式，Vite 项目通常用 createWebHistory
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } }) // 保存重定向路径
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router