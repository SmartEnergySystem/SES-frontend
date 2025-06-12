<template>
  <el-container style="height: 100vh;">
    <el-header>
      智能家居能源管理系统
      <el-button type="danger" @click="handleLogout" style="float: right; margin-top: 14px;">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <Sidebar />
      </el-aside>
      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { api } from '../services/api'


const router = useRouter()

const handleLogout = () => {
  ElMessageBox.confirm('您确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await api.logout()
    } catch (e) {
      // 即使接口报错也继续清理本地
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    router.push('/login')
    ElMessage.success('已成功退出登录')
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
/* Dashboard.vue 特有的样式 */
.el-header {
  position: relative; /* 为了按钮的 float:right 能正确布局 */
}
</style>