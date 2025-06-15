<!--<template>-->
<!--  <el-card class="box-card">-->
<!--    <template #header>-->
<!--      <div class="card-header">-->
<!--        <span>实时能耗监控</span>-->
<!--        <el-button style="float: right; padding: 3px 0" text @click="fetchData">刷新数据</el-button>-->
<!--        <el-tag v-if="newAlertsCount > 0" type="danger" style="float: right; margin-right:10px;">-->
<!--            {{ newAlertsCount }} 条新告警-->
<!--        </el-tag>-->
<!--      </div>-->
<!--    </template>-->
<!--    <el-row :gutter="20">-->
<!--      <el-col :xs="24" :sm="24" :md="16">-->
<!--        <div ref="powerChartRef" class="echarts-container"></div>-->
<!--      </el-col>-->
<!--      <el-col :xs="24" :sm="24" :md="8">-->
<!--        <h4>设备列表</h4>-->
<!--        <el-table :data="devices" stripe height="350" style="width: 100%">-->
<!--          <el-table-column prop="name" label="设备名称"></el-table-column>-->
<!--          <el-table-column prop="power" label="功率 (W)"></el-table-column>-->
<!--          <el-table-column prop="voltage" label="电压 (V)"></el-table-column>-->
<!--          <el-table-column prop="current" label="电流 (A)"></el-table-column>-->
<!--          <el-table-column prop="status" label="状态">-->
<!--            <template #default="scope">-->
<!--              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--      </el-col>-->
<!--    </el-row>-->
<!--  </el-card>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'-->
<!--import { ElMessage } from 'element-plus'-->
<!--import { api } from '../services/api'-->
<!--import * as echarts from 'echarts/core'-->
<!--import { LineChart } from 'echarts/charts'-->
<!--import {-->
<!--  TitleComponent,-->
<!--  TooltipComponent,-->
<!--  GridComponent,-->
<!--  DatasetComponent, // 如果使用 dataset-->
<!--  TransformComponent // 如果使用 dataset-->
<!--} from 'echarts/components'-->
<!--import { CanvasRenderer } from 'echarts/renderers'-->
<!--import { UniversalTransition } from 'echarts/features';-->


<!--// 注册必须的 ECharts 组件-->
<!--echarts.use([-->
<!--  TitleComponent,-->
<!--  TooltipComponent,-->
<!--  GridComponent,-->
<!--  LineChart,-->
<!--  CanvasRenderer,-->
<!--  UniversalTransition,-->
<!--  DatasetComponent,-->
<!--  TransformComponent-->
<!--])-->

<!--const powerChartRef = ref(null)-->
<!--let powerChart = null-->
<!--let pollingInterval = null-->

<!--const devices = ref([])-->
<!--const newAlertsCount = ref(0)-->
<!--const chartData = reactive({-->
<!--  timestamps: [],-->
<!--  powerValues: []-->
<!--})-->

<!--const fetchData = async () => {-->
<!--  try {-->
<!--    const response = await api.getLatestTelemetry()-->
<!--    if (response.data.code === 200) {-->
<!--      devices.value = response.data.data.devices-->
<!--      newAlertsCount.value = response.data.data.newAlertsCount-->
<!--      -->
<!--      const totalPower = devices.value.reduce((sum, dev) => sum + (dev.status === 'ON' ? dev.power : 0), 0)-->
<!--      const now = new Date()-->
<!--      const currentTime = `${('0'+now.getHours()).slice(-2)}:${('0'+now.getMinutes()).slice(-2)}:${('0'+now.getSeconds()).slice(-2)}`-->

<!--      chartData.timestamps.push(currentTime)-->
<!--      chartData.powerValues.push(totalPower)-->

<!--      const maxDataPoints = 20-->
<!--      if (chartData.timestamps.length > maxDataPoints) {-->
<!--        chartData.timestamps.shift()-->
<!--        chartData.powerValues.shift()-->
<!--      }-->
<!--      updateChart()-->
<!--    } else {-->
<!--      ElMessage.error('获取实时数据失败: ' + response.data.message)-->
<!--    }-->
<!--  } catch (error) {-->
<!--    ElMessage.error('获取实时数据请求失败')-->
<!--    console.error(error)-->
<!--  }-->
<!--}-->

<!--const initChart = () => {-->
<!--  if (powerChartRef.value && !powerChart) {-->
<!--    powerChart = echarts.init(powerChartRef.value)-->
<!--    updateChart() -->
<!--  }-->
<!--}-->

<!--const updateChart = () => {-->
<!--  if (!powerChart) return-->
<!--  const option = {-->
<!--    title: { text: '总实时功率 (W)' },-->
<!--    tooltip: { trigger: 'axis' },-->
<!--    xAxis: {-->
<!--      type: 'category',-->
<!--      data: chartData.timestamps,-->
<!--      boundaryGap: false,-->
<!--    },-->
<!--    yAxis: { type: 'value', name: '功率 (W)' },-->
<!--    series: [{-->
<!--      name: '总功率',-->
<!--      type: 'line',-->
<!--      data: chartData.powerValues,-->
<!--      smooth: true,-->
<!--      areaStyle: {}-->
<!--    }],-->
<!--    grid: {-->
<!--      left: '3%',-->
<!--      right: '4%',-->
<!--      bottom: '3%',-->
<!--      containLabel: true-->
<!--    }-->
<!--  }-->
<!--  powerChart.setOption(option)-->
<!--}-->

<!--const getStatusType = (status) => {-->
<!--  if (status === 'ON') return 'success'-->
<!--  if (status === 'OFF') return 'info'-->
<!--  if (status === 'STANDBY') return 'warning'-->
<!--  return ''-->
<!--}-->

<!--const resizeChart = () => {-->
<!--  powerChart?.resize()-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await nextTick() // 确保 DOM 元素已挂载-->
<!--  initChart()-->
<!--  fetchData()-->
<!--  pollingInterval = setInterval(fetchData, 5000)-->
<!--  window.addEventListener('resize', resizeChart)-->
<!--})-->

<!--onUnmounted(() => {-->
<!--  clearInterval(pollingInterval)-->
<!--  powerChart?.dispose()-->
<!--  window.removeEventListener('resize', resizeChart)-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.card-header {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--}-->
<!--</style>-->
<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>实时能耗监控</span>
        <el-button style="float: right; padding: 3px 0" text @click="fetchData">刷新数据</el-button>
        <el-tag v-if="newAlertsCount > 0" type="danger" style="float: right; margin-right:10px;">
          {{ newAlertsCount }} 条新告警
        </el-tag>
      </div>
    </template>

    <!-- 新增设备选择器 -->
    <el-select
      v-model="selectedDevices"
      multiple
      placeholder="请选择设备"
      style="margin-bottom: 20px; width: 100%"
    >
      <el-option
        v-for="device in availableDevices"
        :key="device.id"
        :label="device.name"
        :value="device.id"
      />
    </el-select>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="16">
        <div ref="powerChartRef" class="echarts-container"></div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8">
        <h4>设备列表</h4>
        <el-table :data="devices" stripe height="350" style="width: 100%">
          <el-table-column prop="name" label="设备名称"></el-table-column>
          <el-table-column prop="power" label="功率 (W)"></el-table-column>
          <el-table-column prop="voltage" label="电压 (V)"></el-table-column>
          <el-table-column prop="current" label="电流 (A)"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../services/api'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features';

// 注册必须的 ECharts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  DatasetComponent,
  TransformComponent
])

const powerChartRef = ref(null)
let powerChart = null
let pollingInterval = null

// 新增设备选择相关状态

const availableDevices = ref([
  { id: '1', name: '照明设备' },
  { id: '2', name: '空调设备' },
  { id: '3', name: '电视设备' },
  { id: '4', name: '热水器设备' }
])
const selectedDevices = ref(availableDevices.value.map(d => d.id))
const devices = ref([])
const newAlertsCount = ref(0)
const chartData = reactive({
  timestamps: [],
  powerValues: []
})

// 修改数据获取方法
const fetchData = async () => {
  try {
    // 检查是否有选中的设备
    if (selectedDevices.value.length === 0) {
      ElMessage.warning('请至少选择一个设备')
      return
    }

    // 调用新接口获取设备数据
    const response = await api.getDeviceData(selectedDevices.value)

    if (response.data.code === 200) {
      // 处理新的数据结构
      devices.value = response.data.data.devices
      newAlertsCount.value = response.data.data.newAlertsCount || 0

      // 计算总功率
      const totalPower = devices.value.reduce((sum, dev) => sum + (dev.status === 'ON' ? dev.power : 0), 0)
      const now = new Date()
      const currentTime = `${('0'+now.getHours()).slice(-2)}:${('0'+now.getMinutes()).slice(-2)}:${('0'+now.getSeconds()).slice(-2)}`

      chartData.timestamps.push(currentTime)
      chartData.powerValues.push(totalPower)

      // 限制数据点数量
      const maxDataPoints = 20
      if (chartData.timestamps.length > maxDataPoints) {
        chartData.timestamps.shift()
        chartData.powerValues.shift()
      }
      updateChart()
    } else {
      ElMessage.error('获取实时数据失败: ' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('获取实时数据请求失败')
    console.error(error)
  }
}

const initChart = () => {
  if (powerChartRef.value && !powerChart) {
    powerChart = echarts.init(powerChartRef.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!powerChart) return
  const option = {
    title: { text: '总实时功率 (W)' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: chartData.timestamps,
      boundaryGap: false,
    },
    yAxis: { type: 'value', name: '功率 (W)' },
    series: [{
      name: '总功率',
      type: 'line',
      data: chartData.powerValues,
      smooth: true,
      areaStyle: {}
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  powerChart.setOption(option)
}

const getStatusType = (status) => {
  if (status === 'ON') return 'success'
  if (status === 'OFF') return 'info'
  if (status === 'STANDBY') return 'warning'
  return ''
}

const resizeChart = () => {
  powerChart?.resize()
}

onMounted(async () => {
  await nextTick() // 确保 DOM 元素已挂载
  initChart()
  // 默认选择所有设备
  selectedDevices.value = availableDevices.value.map(d => d.id)
  fetchData()
  pollingInterval = setInterval(fetchData, 5000)
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
  powerChart?.dispose()
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
