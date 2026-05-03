<template>
  <div class="login-page">
    <div class="campus-shape campus-shape-left"></div>
    <div class="campus-shape campus-shape-right"></div>
    <div class="login-card">
      <div class="logo">校</div>
      <h1>校园二手交易管理系统</h1>
      <p>后台管理系统</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleLogin">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!formRef.value) {
    return
  }

  try {
    await formRef.value.validate()
    loading.value = true

    const res = await login({
      username: form.username,
      password: form.password
    })

    userStore.setUserInfo({
      token: res.data.token,
      username: res.data.username,
      nickname: res.data.nickname,
      role: res.data.role
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'

    ElMessage.success('登录成功')
    router.push(redirect)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(239, 246, 255, 0.92)),
    linear-gradient(135deg, #eaf3ff, #f8fbff);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 360px;
  padding: 34px 32px 32px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(47, 124, 246, 0.12);
}

.logo {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  border-radius: 50%;
  color: #fff;
  background: #2f7cf6;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(47, 124, 246, 0.25);
}

.login-card h1 {
  margin: 0 0 8px;
  text-align: center;
  font-size: 22px;
  color: #17233d;
}

.login-card p {
  margin: 0 0 28px;
  text-align: center;
  color: #6b778c;
}

.login-button {
  width: 100%;
  margin-top: 4px;
}

.campus-shape {
  position: absolute;
  bottom: -80px;
  width: 360px;
  height: 220px;
  border-radius: 40px 40px 0 0;
  background: rgba(47, 124, 246, 0.08);
}

.campus-shape::before,
.campus-shape::after {
  content: "";
  position: absolute;
  background: rgba(47, 124, 246, 0.1);
}

.campus-shape::before {
  left: 42px;
  top: 58px;
  width: 80px;
  height: 16px;
  box-shadow:
    0 38px 0 rgba(47, 124, 246, 0.1),
    150px 0 0 rgba(47, 124, 246, 0.1),
    150px 38px 0 rgba(47, 124, 246, 0.1);
}

.campus-shape::after {
  right: 54px;
  top: -44px;
  width: 88px;
  height: 88px;
  border-radius: 50%;
}

.campus-shape-left {
  left: -90px;
}

.campus-shape-right {
  right: -90px;
}
</style>
