<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-sidebar"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    router
  >
    <el-menu-item index="/realtime">
      <el-icon><DataLine /></el-icon>
      <span>实时能耗监控</span>
    </el-menu-item>
    <el-menu-item index="/history">
      <el-icon><Histogram /></el-icon>
      <span>历史数据分析</span>
    </el-menu-item>
    <el-menu-item index="/policies">
      <el-icon><Setting /></el-icon>
      <span>策略配置管理</span>
    </el-menu-item>
    <el-menu-item index="/alerts">
      <el-icon><WarningFilled /></el-icon>
      <span>告警管理</span>
    </el-menu-item>
    <el-menu-item index="/device/list">
      <el-icon><Cpu /></el-icon>
      <span>设备管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Cpu, DataLine, Histogram, Setting, WarningFilled } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)

// 示例：判断是否为管理员，用于控制菜单显示
// const userRole = localStorage.getItem('userRole')
// const isAdmin = computed(() => userRole === 'ADMIN')
</script>

<style scoped>
.el-menu-sidebar {
  height: 100%; /* 确保菜单填满侧边栏 */
}
</style>