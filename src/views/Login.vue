<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-title">智能家居能源管理系统</div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0px" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名 (admin/user)" prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码 (password)" prefix-icon="Lock" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="text-xs text-gray-500 mt-4 text-center">
        <p>测试账户:</p>
        <p>管理员: admin / password</p>
        <p>普通用户: user / password</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../services/api' // 导入 API 服务

const router = useRouter()
const route = useRoute() // 获取当前路由信息，用于重定向
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: ''
})
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})
const loading = ref(false)

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await api.login(loginForm.username, loginForm.password)
        if (response.data.code === 200 && response.data.data.token) {
          localStorage.setItem('token', response.data.data.token)
          localStorage.setItem('userRole', response.data.data.role)
          ElMessage.success('登录成功')
          // 检查是否有重定向地址
          const redirectPath = route.query.redirect || '/'
          router.push(redirectPath)
        } else {
          ElMessage.error(response.data.message || '登录失败')
        }
      } catch (error) {
        const errMsg = error.response?.data?.error || error.response?.data?.message || '登录请求失败'
        ElMessage.error(errMsg)
        console.error('Login error:', error.response || error.message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* Login.vue 特有的样式可以放在这里 */
.text-xs { font-size: 0.75rem; }
.text-gray-500 { color: #6b7280; }
.mt-4 { margin-top: 1rem; }
.text-center { text-align: center; }
</style>