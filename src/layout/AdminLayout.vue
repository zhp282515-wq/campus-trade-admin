<template>
  <div class="admin-layout">
    <AppSidebar />
    <div class="admin-main">
      <AppHeader />
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--app-bg);
}

.admin-main {
  min-width: 0;
  margin-left: 220px;
}

.admin-content {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: var(--app-bg);
}
</style>
