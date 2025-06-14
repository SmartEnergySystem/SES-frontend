<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>告警管理</span>
        <div style="float: right; display: flex; gap: 10px;">
          <el-select v-model="selectedDeviceId" placeholder="选择设备" style="width: 200px;" clearable>
            <el-option
              v-for="device in devices"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />
          <el-button type="primary" @click="fetchAlertReport">刷新告警</el-button>
        </div>
      </div>
    </template>
    <el-table :data="alerts" stripe style="width: 100%" empty-text="暂无告警数据">
      <el-table-column prop="timestamp" label="告警时间" :formatter="formatTimestamp" width="180"></el-table-column>
      <el-table-column prop="deviceName" label="设备名称" width="120"></el-table-column>
      <el-table-column prop="level" label="级别" width="100">
        <template #default="scope">
          <el-tag :type="getSeverityType(scope.row.level)">
            {{ formatLevel(scope.row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="告警信息" show-overflow-tooltip></el-table-column>
      <el-table-column prop="modeName" label="模式" width="120"></el-table-column>
      <el-table-column prop="policyName" label="策略" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          {{ formatStatus(scope.row.status) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../services/api'

const devices = ref([]) // 设备列表
const selectedDeviceId = ref(null) // 选中的设备 ID
const timeRange = ref([]) // 时间范围 [startTime, endTime]
const alerts = ref([]) // 告警数据

// 获取设备列表
const loadDevices = async () => {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('id')
    if (!token || !userId) {
      ElMessage.error('用户未登录，请先登录')
      devices.value = []
      return
    }
    const response = await api.getDevicePage(
      { page: 1, pageSize: 100, userId: parseInt(userId) },
    )
    if (response.data.code === 0 && response.data.data.records.length > 0) {
      devices.value = response.data.data.records
    } else {
      ElMessage.info('暂无设备')
      devices.value = []
    }
  } catch (error) {
    ElMessage.error('获取设备列表请求失败')
    console.error(error)
    devices.value = []
  }
}

// 获取告警报告
const fetchAlertReport = async () => {
  alerts.value = []
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('用户未登录，请先登录')
      return
    }
    // 构造请求的 DTO
    const dto = timeRange.value.length === 2 ? {
      startTime: timeRange.value[0],
      endTime: timeRange.value[1]
    } : {}

    // 如果选择了设备，直接查询该设备的告警
    if (selectedDeviceId.value) {
      const response = await api.getAlertReport(
        selectedDeviceId.value,
        dto,
        { headers: { Token: `${token}` } }
      )
      if (response.data.code === 0) {
        const device = devices.value.find(d => String(d.id) === String(selectedDeviceId.value))
        alerts.value = (response.data.data.alertReports || []).map(report => ({
          ...report,
          deviceName: device ? device.name : '未知设备'
        }))
      } else {
        ElMessage.error('获取告警报告失败: ' + response.data.message)
      }
      return
    }

    // 未选择设备，查询所有设备的告警
    if (devices.value.length === 0) {
      ElMessage.info('暂无设备，无法查询告警')
      return
    }

    // 逐个设备获取告警报告并合并
    const alertPromises = devices.value.map(device =>
      api.getAlertReport(
        device.id,
        dto,
        { headers: { Token: `${token}` } }
      ).catch(error => {
        console.error(`设备 ${device.id} 告警获取失败`, error)
        return { data: { code: 0, data: { alertReports: [] } } }
      })
    )
    const responses = await Promise.all(alertPromises)
    responses.forEach((response, index) => {
      if (response.data.code === 0) {
        const device = devices.value[index]
        alerts.value.push(
          ...(response.data.data.alertReports || []).map(report => ({
            ...report,
            deviceName: device.name
          }))
        )
      }
    })

    if (alerts.value.length === 0) {
      ElMessage.info('暂无告警数据')
    }
  } catch (error) {
    ElMessage.error('获取告警报告请求失败')
    console.error(error)
  }
}

// 格式化告警级别
const formatLevel = (level) => {
  const levels = { 0: '低', 1: '中', 2: '高' }
  return levels[level] || '未知'
}

// 格式化告警状态
const formatStatus = (status) => {
  const statuses = { 0: '未处理', 1: '已处理', 2: '忽略' }
  return statuses[status] || '未知'
}

// 格式化告警级别对应的标签类型
const getSeverityType = (level) => {
  if (level === 2) return 'danger'
  if (level === 1) return 'warning'
  if (level === 0) return 'info'
  return ''
}

// 格式化时间戳
const formatTimestamp = (row, column, cellValue) => {
  if (!cellValue) return ''
  return new Date(cellValue).toLocaleString()
}

// 组件挂载时加载设备列表并获取默认告警
onMounted(() => {
  loadDevices().then(() => fetchAlertReport())
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>