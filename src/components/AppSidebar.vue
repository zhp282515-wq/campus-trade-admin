<template>
  <aside class="app-sidebar">
    <div class="brand">
      <div class="brand-mark">校</div>
      <div class="brand-text">
        <strong>校园二手交易</strong>
        <span>后台管理系统</span>
      </div>
    </div>
    <el-menu
      router
      :default-active="$route.path"
      background-color="#0e1e33"
      text-color="#c8d3e0"
      active-text-color="#ffffff"
      class="sidebar-menu"
    >
      <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import {
  Collection,
  DataAnalysis,
  Goods,
  OfficeBuilding,
  Tickets,
  User,
  Warning
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const menus = [
  {
    title: '数据看板',
    path: '/dashboard',
    icon: DataAnalysis,
    roles: ['admin', 'auditor']
  },
  {
    title: '商品管理',
    path: '/goods/list',
    icon: Goods,
    roles: ['admin', 'auditor']
  },
  {
    title: '用户管理',
    path: '/users/list',
    icon: User,
    roles: ['admin']
  },
  {
    title: '订单管理',
    path: '/orders/list',
    icon: Tickets,
    roles: ['admin']
  },
  {
    title: '分类管理',
    path: '/categories/list',
    icon: Collection,
    roles: ['admin']
  },
  {
    title: '学院管理',
    path: '/colleges/list',
    icon: OfficeBuilding,
    roles: ['admin']
  },
  {
    title: '举报审核',
    path: '/reports/list',
    icon: Warning,
    roles: ['admin', 'auditor']
  }
]

const visibleMenus = computed(() => {
  return menus.filter((item) => item.roles.includes(userStore.role))
})
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  width: 220px;
  background: #0e1e33;
  color: #fff;
  box-shadow: 4px 0 14px rgba(13, 30, 51, 0.12);
}

.brand {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #2f7cf6;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}

.brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.brand-text strong {
  color: #fff;
  font-size: 15px;
}

.brand-text span {
  color: #8fa3bd;
  font-size: 12px;
}

.sidebar-menu {
  border-right: 0;
  padding: 10px 8px;
}

:deep(.el-menu-item) {
  height: 44px;
  margin: 4px 0;
  border-radius: 6px;
}

:deep(.el-menu-item:hover) {
  background: rgba(47, 124, 246, 0.16);
}

:deep(.el-menu-item.is-active) {
  background: #2f7cf6;
}
</style>
