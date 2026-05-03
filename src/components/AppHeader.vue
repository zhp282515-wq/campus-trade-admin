<template>
  <header class="app-header">
    <div class="left">
      <el-icon class="menu-icon"><Menu /></el-icon>
      <div>
        <div class="system-name">校园二手交易后台管理系统</div>
        <div class="breadcrumb">首页 / {{ route.meta.title || '数据看板' }}</div>
      </div>
    </div>
    <div class="right">
      <div class="user-info">
        <span class="nickname">{{ userStore.nickname || userStore.username || '未登录' }}</span>
        <el-tag size="small" type="primary">{{ roleText }}</el-tag>
      </div>
      <el-button plain :icon="themeIcon" @click="handleThemeToggle">
        {{ themeText }}
      </el-button>
      <el-button type="primary" plain :icon="SwitchButton" @click="handleLogout">
        退出登录
      </el-button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, Moon, Sunny, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { getTheme, toggleTheme } from '../utils/theme'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const theme = ref(getTheme())

const roleText = computed(() => {
  const roleMap = {
    admin: '管理员',
    auditor: '审核员'
  }

  return roleMap[userStore.role] || '未登录'
})

const isDark = computed(() => {
  return theme.value === 'dark'
})

const themeText = computed(() => {
  return isDark.value ? '浅色' : '深色'
})

const themeIcon = computed(() => {
  return isDark.value ? Sunny : Moon
})

function handleThemeToggle() {
  theme.value = toggleTheme()
  ElMessage.success(`已切换为${isDark.value ? '深色' : '浅色'}主题`)
}

function handleLogout() {
  userStore.logoutAction()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--app-card-bg);
  border-bottom: 1px solid var(--app-border);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  color: var(--app-text);
  font-size: 20px;
}

.system-name {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 600;
}

.breadcrumb {
  margin-top: 2px;
  color: var(--app-text-secondary);
  font-size: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 500;
}
</style>
