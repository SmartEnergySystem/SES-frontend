<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>告警管理 (仅显示活动告警)</span>
        <el-button type="primary" @click="fetchAlerts" style="float: right;">刷新告警</el-button>
      </div>
    </template>
    <el-table :data="alerts" stripe style="width: 100%" empty-text="暂无活动告警">
      <el-table-column prop="timestamp" label="告警时间" :formatter="formatTimestamp" width="180"></el-table-column>
      <el-table-column prop="device_id" label="设备ID" width="100"></el-table-column>
      <el-table-column prop="message" label="告警信息" show-overflow-tooltip></el-table-column>
      <el-table-column prop="severity" label="级别" width="100">
        <template #default="scope">
          <el-tag :type="getSeverityType(scope.row.severity)">
            {{ scope.row.severity }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="recommended_action" label="建议操作" width="120"></el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleResolveAlert(scope.row.id, scope.row.recommended_action)">
            处理 ({{scope.row.recommended_action}})
          </el-button>
            <el-button size="small" @click="handleResolveAlert(scope.row.id, 'IGNORE')">忽略</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../services/api'

const alerts = ref([])

const fetchAlerts = async () => {
  try {
    const response = await api.getAlerts({ status: 'active' })
    if (response.data.code === 200) {
      alerts.value = response.data.data.alerts
    } else {
      ElMessage.error('获取告警列表失败: ' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('获取告警列表请求失败')
    console.error(error)
  }
}

const handleResolveAlert = async (alertId, action) => {
  ElMessageBox.confirm(`确定要执行操作 "${action}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.resolveAlert(alertId, { action: action })
      if (response.data.code === 200 && response.data.data.resolved) {
        ElMessage.success(`告警已处理: ${action}`)
        fetchAlerts()
      } else {
        ElMessage.error('处理告警失败: ' + response.data.message)
      }
    } catch (error) {
      ElMessage.error('处理告警请求失败')
      console.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const getSeverityType = (severity) => {
  if (severity === 'HIGH') return 'danger'
  if (severity === 'MEDIUM') return 'warning'
  if (severity === 'LOW') return 'info'
  return ''
}

const formatTimestamp = (row, column, cellValue) => {
  if (!cellValue) return ''
  return new Date(cellValue).toLocaleString()
}

onMounted(fetchAlerts)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>