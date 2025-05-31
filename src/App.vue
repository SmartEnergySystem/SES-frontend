<template>
  <router-view></router-view>
</template>

<script setup>
// 通常 App.vue 比较简单，主要用于承载路由视图
</script>

<style>
/* 这里可以放一些非常全局的样式，但更推荐在 assets 目录下管理 */
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif; /* 确保字体定义 */
}

/* 将之前 HTML 中 style 标签内的全局样式移到这里或 assets/base.css */
.el-header {
  background-color: #409eff;
  color: white;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
}
.el-aside {
  background-color: #545c64;
  color: white;
  height: calc(100vh - 60px); /* 减去 header 高度 */
}
.el-main {
  padding: 20px;
  background-color: #f4f6f9;
  height: calc(100vh - 60px); /* 减去 header 高度 */
  overflow-y: auto; /* 如果内容超长，允许滚动 */
}
.echarts-container {
  width: 100%;
  height: 400px;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
  padding: 20px;
}
.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}
.el-menu {
  border-right: none !important; /* 覆盖 Element Plus 默认边框 */
}
</style>