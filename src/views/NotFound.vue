<template>
  <div class="not-found-container">
    <el-result
      icon="error"
      title="404 - 页面未找到"
      sub-title="抱歉，您访问的页面不存在。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
// No specific script needed for a simple 404 page
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px); /* Adjust based on your layout */
}
</style>