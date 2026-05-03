import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

import AdminLayout from '../layout/AdminLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Forbidden from '../views/Forbidden.vue'
import NotFound from '../views/NotFound.vue'
import GoodsList from '../views/goods/GoodsList.vue'
import UserList from '../views/users/UserList.vue'
import OrderList from '../views/orders/OrderList.vue'
import CategoryList from '../views/categories/CategoryList.vue'
import CollegeList from '../views/colleges/CollegeList.vue'
import ReportList from '../views/reports/ReportList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '数据看板',
          requiresAuth: true,
          roles: ['admin', 'auditor']
        }
      },
      {
        path: 'goods/list',
        name: 'GoodsList',
        component: GoodsList,
        meta: {
          title: '商品管理',
          requiresAuth: true,
          roles: ['admin', 'auditor']
        }
      },
      {
        path: 'users/list',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'orders/list',
        name: 'OrderList',
        component: OrderList,
        meta: {
          title: '订单管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'categories/list',
        name: 'CategoryList',
        component: CategoryList,
        meta: {
          title: '分类管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'colleges/list',
        name: 'CollegeList',
        component: CollegeList,
        meta: {
          title: '学院管理',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'reports/list',
        name: 'ReportList',
        component: ReportList,
        meta: {
          title: '举报审核',
          requiresAuth: true,
          roles: ['admin', 'auditor']
        }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      title: '无权限',
      requiresAuth: true,
      roles: ['admin', 'auditor']
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  userStore.loadFromStorage()

  if (to.path === '/login' && userStore.isLogin) {
    return '/dashboard'
  }

  if (to.meta.requiresAuth && !userStore.isLogin) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    return '/403'
  }

  return true
})

export default router
