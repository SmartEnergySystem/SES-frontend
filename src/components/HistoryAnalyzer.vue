<!--<template>-->
<!--  <el-card class="box-card">-->
<!--    <template #header>历史数据分析</template>-->
<!--    <el-form :inline="true" :model="filterForm" @submit.prevent="fetchHistoryData">-->
<!--      <el-form-item label="日期范围">-->
<!--        <el-date-picker-->
<!--          v-model="filterForm.dateRange"-->
<!--          type="daterange"-->
<!--          range-separator="至"-->
<!--          start-placeholder="开始日期"-->
<!--          end-placeholder="结束日期"-->
<!--          value-format="YYYY-MM-DD">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="周期">-->
<!--            <el-select v-model="filterForm.period" placeholder="选择周期">-->
<!--            <el-option label="每日" value="daily"></el-option>-->
<!--            <el-option label="每周" value="weekly"></el-option>-->
<!--            <el-option label="每月" value="monthly"></el-option>-->
<!--          </el-select>-->
<!--      </el-form-item>-->
<!--      <el-form-item>-->
<!--        <el-button type="primary" @click="fetchHistoryData">查询</el-button>-->
<!--      </el-form-item>-->
<!--    </el-form>-->

<!--    <el-row :gutter="20" style="margin-top: 20px;">-->
<!--      <el-col :xs="24" :sm="24" :md="12">-->
<!--        <div ref="consumptionChartRef" class="echarts-container"></div>-->
<!--      </el-col>-->
<!--      <el-col :xs="24" :sm="24" :md="12">-->
<!--        <div ref="breakdownChartRef" class="echarts-container"></div>-->
<!--      </el-col>-->
<!--    </el-row>-->
<!--  </el-card>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'-->
<!--import { ElMessage } from 'element-plus'-->
<!--import { api } from '../services/api'-->
<!--import * as echarts from 'echarts/core'-->
<!--import { BarChart, PieChart } from 'echarts/charts'-->
<!--import {-->
<!--  TitleComponent,-->
<!--  TooltipComponent,-->
<!--  GridComponent,-->
<!--  LegendComponent-->
<!--} from 'echarts/components'-->
<!--import { CanvasRenderer } from 'echarts/renderers'-->

<!--echarts.use([-->
<!--  TitleComponent,-->
<!--  TooltipComponent,-->
<!--  GridComponent,-->
<!--  LegendComponent,-->
<!--  BarChart,-->
<!--  PieChart,-->
<!--  CanvasRenderer-->
<!--])-->

<!--const consumptionChartRef = ref(null)-->
<!--const breakdownChartRef = ref(null)-->
<!--let consumptionChart = null-->
<!--let breakdownChart = null-->

<!--const filterForm = reactive({-->
<!--  dateRange: ['', ''],-->
<!--  period: 'daily'-->
<!--})-->
<!--const historyData = ref({-->
<!--  periodData: [],-->
<!--  deviceBreakdown: []-->
<!--})-->

<!--const fetchHistoryData = async () => {-->
<!--  try {-->
<!--    const params = {-->
<!--      start: filterForm.dateRange && filterForm.dateRange[0] ? filterForm.dateRange[0] : undefined,-->
<!--      end: filterForm.dateRange && filterForm.dateRange[1] ? filterForm.dateRange[1] : undefined,-->
<!--      period: filterForm.period-->
<!--    }-->
<!--    if (!params.start || !params.end) {-->
<!--      ElMessage.warning('请选择日期范围')-->
<!--      return-->
<!--    }-->
<!--    const response = await api.getHistoryAnalytics(params)-->
<!--    if (response.data.code === 200) {-->
<!--      historyData.value = response.data.data-->
<!--      updateCharts()-->
<!--    } else {-->
<!--      ElMessage.error('获取历史数据失败: ' + response.data.message)-->
<!--    }-->
<!--  } catch (error) {-->
<!--    ElMessage.error('获取历史数据请求失败')-->
<!--    console.error(error)-->
<!--  }-->
<!--}-->

<!--const initCharts = () => {-->
<!--  if (consumptionChartRef.value && !consumptionChart) {-->
<!--    consumptionChart = echarts.init(consumptionChartRef.value)-->
<!--  }-->
<!--  if (breakdownChartRef.value && !breakdownChart) {-->
<!--    breakdownChart = echarts.init(breakdownChartRef.value)-->
<!--  }-->
<!--}-->

<!--const updateCharts = () => {-->
<!--  if (!historyData.value) return-->

<!--  if (consumptionChart) {-->
<!--    const option = {-->
<!--      title: { text: '能耗趋势 (kWh)' },-->
<!--      tooltip: { trigger: 'axis' },-->
<!--      xAxis: {-->
<!--        type: 'category',-->
<!--        data: historyData.value.periodData.map(d => d.date)-->
<!--      },-->
<!--      yAxis: { type: 'value', name: 'kWh' },-->
<!--      series: [{-->
<!--        name: '总能耗',-->
<!--        type: 'bar',-->
<!--        data: historyData.value.periodData.map(d => d.totalConsumption)-->
<!--      }],-->
<!--      grid: { containLabel: true, left: '3%', right: '4%', bottom: '3%' }-->
<!--    }-->
<!--    consumptionChart.setOption(option, true)-->
<!--  }-->

<!--  if (breakdownChart) {-->
<!--    const option = {-->
<!--      title: { text: '设备能耗占比', left: 'center' },-->
<!--      tooltip: { trigger: 'item' },-->
<!--      legend: { orient: 'vertical', left: 'left', top: 'middle' },-->
<!--      series: [{-->
<!--        name: '能耗占比',-->
<!--        type: 'pie',-->
<!--        radius: ['40%', '70%'],-->
<!--        avoidLabelOverlap: false,-->
<!--        itemStyle: {-->
<!--          borderRadius: 10,-->
<!--          borderColor: '#fff',-->
<!--          borderWidth: 2-->
<!--        },-->
<!--        label: { show: false, position: 'center' },-->
<!--        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },-->
<!--        labelLine: { show: false },-->
<!--        data: historyData.value.deviceBreakdown.map(d => ({ value: d.percentage, name: d.name })),-->
<!--      }],-->
<!--    }-->
<!--    breakdownChart.setOption(option, true)-->
<!--  }-->
<!--}-->

<!--const resizeCharts = () => {-->
<!--  consumptionChart?.resize()-->
<!--  breakdownChart?.resize()-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await nextTick()-->
<!--  initCharts()-->
<!--  const endDate = new Date()-->
<!--  const startDate = new Date()-->
<!--  startDate.setDate(endDate.getDate() - 6)-->
<!--  filterForm.dateRange = [-->
<!--    `${startDate.getFullYear()}-${('0' + (startDate.getMonth() + 1)).slice(-2)}-${('0' + startDate.getDate()).slice(-2)}`,-->
<!--    `${endDate.getFullYear()}-${('0' + (endDate.getMonth() + 1)).slice(-2)}-${('0' + endDate.getDate()).slice(-2)}`-->
<!--  ]-->
<!--  fetchHistoryData()-->
<!--  window.addEventListener('resize', resizeCharts)-->
<!--})-->

<!--onUnmounted(() => {-->
<!--  consumptionChart?.dispose()-->
<!--  breakdownChart?.dispose()-->
<!--  window.removeEventListener('resize', resizeCharts)-->
<!--})-->
<!--</script>-->
<template>
  <el-card class="box-card">
    <template #header>历史数据分析</template>
    <el-form :inline="true" :model="filterForm" @submit.prevent="fetchHistoryData">
      <!-- 新增设备选择器 -->
      <el-form-item label="选择设备">
        <el-select
          v-model="filterForm.deviceId"
          placeholder="请选择设备"
          style="width: 200px"
        >
          <el-option
            v-for="device in availableDevices"
            :key="device.id"
            :label="device.name"
            :value="device.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="日期范围">
        <el-date-picker
          v-model="filterForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="周期">
        <el-select v-model="filterForm.period" placeholder="选择周期">
          <el-option label="每日" value="daily"></el-option>
          <el-option label="每周" value="weekly"></el-option>
          <el-option label="每月" value="monthly"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchHistoryData">查询</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="24" :md="12">
        <div ref="consumptionChartRef" class="echarts-container"></div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <div ref="breakdownChartRef" class="echarts-container"></div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../services/api'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  PieChart,
  CanvasRenderer
])

const consumptionChartRef = ref(null)
const breakdownChartRef = ref(null)
let consumptionChart = null
let breakdownChart = null

// 新增设备列表
const availableDevices = ref([
  { id: '1', name: '照明设备' },
  { id: '2', name: '空调设备' },
  { id: '3', name: '电视设备' },
  { id: '4', name: '热水器设备' }
])

// 修改 filterForm 结构
const filterForm = reactive({
  deviceId: availableDevices.value[0]?.id || '',
  dateRange: ['', ''],
  period: 'daily'
})
const historyData = ref({
  periodData: [],
  deviceBreakdown: []
})

// 修改数据获取方法
const fetchHistoryData = async () => {
  try {
    // 验证设备ID
    if (!filterForm.deviceId) {
      ElMessage.warning('请选择设备')
      return
    }

    // 验证日期范围
    if (!filterForm.dateRange || filterForm.dateRange.length !== 2 ||
      !filterForm.dateRange[0] || !filterForm.dateRange[1]) {
      ElMessage.warning('请选择日期范围')
      return
    }

    // 构造请求DTO
    const dto = {
      start: filterForm.dateRange[0],
      end: filterForm.dateRange[1],
      period: filterForm.period
    }

    // 调用新接口
    const response = await api.getDeviceReport(filterForm.deviceId, dto)

    if (response.data.code === 200) {
      historyData.value = response.data.data
      updateCharts()
    } else {
      ElMessage.error('获取历史数据失败: ' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('获取历史数据请求失败')
    console.error(error)
  }
}

const initCharts = () => {
  if (consumptionChartRef.value && !consumptionChart) {
    consumptionChart = echarts.init(consumptionChartRef.value)
  }
  if (breakdownChartRef.value && !breakdownChart) {
    breakdownChart = echarts.init(breakdownChartRef.value)
  }
}

const updateCharts = () => {
  if (!historyData.value) return

  if (consumptionChart) {
    const option = {
      title: { text: '能耗趋势 (kWh)' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: historyData.value.periodData.map(d => d.date)
      },
      yAxis: { type: 'value', name: 'kWh' },
      series: [{
        name: '总能耗',
        type: 'bar',
        data: historyData.value.periodData.map(d => d.totalConsumption)
      }],
      grid: { containLabel: true, left: '3%', right: '4%', bottom: '3%' }
    }
    consumptionChart.setOption(option, true)
  }

  if (breakdownChart) {
    const option = {
      title: { text: '设备能耗占比', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [{
        name: '能耗占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: historyData.value.deviceBreakdown.map(d => ({ value: d.percentage, name: d.name })),
      }],
    }
    breakdownChart.setOption(option, true)
  }
}

const resizeCharts = () => {
  consumptionChart?.resize()
  breakdownChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initCharts()
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 6)
  filterForm.dateRange = [
    `${startDate.getFullYear()}-${('0' + (startDate.getMonth() + 1)).slice(-2)}-${('0' + startDate.getDate()).slice(-2)}`,
    `${endDate.getFullYear()}-${('0' + (endDate.getMonth() + 1)).slice(-2)}-${('0' + endDate.getDate()).slice(-2)}`
  ]
  // 默认选择一个设备
  if (availableDevices.value.length > 0) {
    filterForm.deviceId = availableDevices.value[0].id
  }
  fetchHistoryData()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  consumptionChart?.dispose()
  breakdownChart?.dispose()
  window.removeEventListener('resize', resizeCharts)
})
</script>
