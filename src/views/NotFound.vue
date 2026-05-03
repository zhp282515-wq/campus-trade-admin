<template>
  <div class="error-page">
    <h1>404</h1>
    <p>抱歉，页面不存在</p>
    <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.error-page h1 {
  margin: 0;
  color: #0e1e33;
  font-size: 72px;
}

.error-page p {
  margin: 16px 0 24px;
  color: #6b778c;
}
</style>
