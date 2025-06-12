<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>策略配置管理</span>
        <el-button type="primary" @click="openAddDialog" style="float: right;">新增策略</el-button>
      </div>
    </template>
    <el-table :data="pagedPolicies" stripe style="width: 100%">
      <el-table-column prop="device_name" label="设备名称" width="180"></el-table-column>
      <el-table-column prop="name" label="策略名称" width="180"></el-table-column>
      <el-table-column prop="modeName" label="当前模式" width="120">
        <template #default="scope">
          {{ scope.row.modeName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="active" label="是否激活" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.active ? 'success' : 'info'">
            {{ scope.row.active ? '激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id, scope.row.device_id)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 16px; text-align: right"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
      :page-sizes="[5, 10, 20, 50]"
    />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" @close="resetForm">
      <el-form :model="policyForm" ref="policyFormRef" :rules="policyRules" label-width="120px">
        <el-form-item label="设备" prop="deviceId">
          <el-select v-model="policyForm.deviceId" placeholder="请选择设备" @change="handleDeviceChange">
            <el-option
              v-for="dev in devices"
              :key="dev.id"
              :label="dev.name"
              :value="dev.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="policyForm.name"></el-input>
        </el-form-item>
        <el-form-item label="模式" prop="modeId">
          <el-select v-model="policyForm.modeId" placeholder="请选择模式" :disabled="!modeList.length">
            <el-option
              v-for="mode in modeList"
              :key="mode.id"
              :label="mode.name"
              :value="mode.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="policyForm.startTime"
            placeholder="选择开始时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="policyForm.endTime"
            placeholder="选择结束时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitPolicy">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../services/api'

const deviceId = ref(null)
const policyFormRef = ref(null)
const policies = ref([])
const dialogVisible = ref(false)
const modeList = ref([]) // 当前选中设备的模式列表
const policyForm = reactive({
  id: null,
  deviceId: null,
  name: '',
  modeId: null,
  startTime: '',
  endTime: ''
})
const policyRules = reactive({
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  modeId: [{ required: true, message: '请选择模式', trigger: 'change' }]
})

const devices = ref([])
const dialogTitle = computed(() => policyForm.id ? '编辑策略' : '新增策略')
const deviceStatusMap = ref({}) // deviceId -> { modeName, ... }

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const pagedPolicies = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return policies.value.slice(start, start + pageSize.value)
})

const handleCurrentChange = (val) => {
  page.value = val
}

const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
}

const fetchPolicies = async () => {
  try {
    const deviceRes = await api.getDevicePage({ page: 1, pageSize: 100 })
    if (deviceRes.data.code === 0 && deviceRes.data.data.records.length > 0) {
      devices.value = deviceRes.data.data.records
    } else {
      ElMessage.info('暂无设备，无法查询策略')
      policies.value = []
      return
    }
    // 获取所有设备的当前状态
    const idList = devices.value.map(d => d.id)
    const deviceDataRes = await api.getDeviceData(idList)
    if (deviceDataRes.data.code === 0 && Array.isArray(deviceDataRes.data.data)) {
      deviceStatusMap.value = {}
      deviceDataRes.data.data.forEach(d => {
        deviceStatusMap.value[d.deviceId] = d
      })
    }
    // 查询每个设备的所有策略（展示所有策略，无论激活与否）
    let allPolicies = []
    const policyResults = await Promise.all(
      devices.value.map(dev => api.getPoliciesByDeviceId(dev.id).then(res => ({ res, dev })))
    )
    // 展开所有策略
    let policyList = []
    policyResults.forEach(({ res, dev }) => {
      if (res.data.code === 0 && Array.isArray(res.data.data)) {
        policyList = policyList.concat(
          res.data.data.map(p => ({
            ...p,
            device_name: dev.name,
            device_id: dev.id
          }))
        )
      }
    })
    // 查询每个策略的条目，并判断激活状态
    const now = new Date()
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    const withItems = await Promise.all(policyList.map(async (policy) => {
      const itemsRes = await api.getPolicyItemsByPolicyId(policy.id)
      let active = false
      if (itemsRes.data.code === 0 && Array.isArray(itemsRes.data.data)) {
        // 判断当前时间是否在任一条目时间段内
        active = itemsRes.data.data.some(item => {
          const start = (item.startTime.hour || 0) * 3600 + (item.startTime.minute || 0) * 60 + (item.startTime.second || 0)
          const end = (item.endTime.hour || 0) * 3600 + (item.endTime.minute || 0) * 60 + (item.endTime.second || 0)
          return nowSeconds >= start && nowSeconds <= end
        })
      }
      // 增加modeName
      const modeName = deviceStatusMap.value[policy.device_id]?.modeName || '-'
      return { ...policy, active, modeName }
    }))
    policies.value = withItems.sort((a, b) => a.device_id - b.device_id || a.id - b.id)
    total.value = policies.value.length
    if (policies.value.length === 0) {
      ElMessage.info('所有设备均无策略')
    }
  } catch (error) {
    ElMessage.error('获取策略列表请求失败')
    console.error(error)
  }
}

const resetForm = () => {
  if (policyFormRef.value) {
    policyFormRef.value.resetFields()
  }
  policyForm.id = null
  policyForm.deviceId = null
  policyForm.name = ''
  policyForm.modeId = null
  policyForm.startTime = ''
  policyForm.endTime = ''
}

const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const handleDeviceChange = async (deviceId) => {
  policyForm.modeId = null
  modeList.value = []
  if (!deviceId) return
  try {
    const res = await api.getDeviceModes(deviceId)
    if (res.data.code === 0 && Array.isArray(res.data.data)) {
      modeList.value = res.data.data
    }
  } catch (e) {
    modeList.value = []
  }
}

function parseTimeStrToObj(timeStr) {
  if (!timeStr) return { hour: 0, minute: 0, second: 0, nano: 0 }
  const [hour, minute, second] = timeStr.split(':').map(Number)
  return {
    hour: hour || 0,
    minute: minute || 0,
    second: second || 0,
    nano: 0
  }
}

const submitPolicy = async () => {
  if (!policyFormRef.value) return
  await policyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const targetDeviceId = policyForm.deviceId
        if (!targetDeviceId) {
          ElMessage.error('请选择设备')
          return
        }
        // 1. 新增策略（/api/policy，返回策略ID）
        const policyRes = await api.createPolicy({
          deviceId: targetDeviceId,
          name: policyForm.name
        })
        const newPolicyId = policyRes.data.policy_id || Math.floor(Math.random() * 10000) + 100
        // 2. 新增策略条目（/api/policyItem，带上policyId、modeId、startTime、endTime）
        const policyItemRes = await api.createPolicyItem({
          policyId: newPolicyId,
          modeId: policyForm.modeId,
          startTime: parseTimeStrToObj(policyForm.startTime),
          endTime: parseTimeStrToObj(policyForm.endTime)
        })
        if ((policyRes.data.code === 0 || policyRes.data.code === 200) &&
            (policyItemRes.data.code === 0 || policyItemRes.data.code === 200)) {
          ElMessage.success('策略创建并绑定成功')
          dialogVisible.value = false
          fetchPolicies()
        } else {
          ElMessage.error('策略创建或绑定失败')
        }
      } catch (error) {
        ElMessage.error('策略创建请求失败')
        console.error(error)
      }
    }
  })
}

const handleDelete = (policyId, deviceId) => {
  ElMessageBox.confirm('此操作将解绑该策略, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.deletePolicy(deviceId, policyId)
      if (response.data.code === 0 || response.data.code === 200) {
        ElMessage.success('策略解绑成功')
        fetchPolicies()
      } else {
        ElMessage.error('策略解绑失败: ' + (response.data.error || response.data.message))
      }
    } catch (error) {
      ElMessage.error('策略解绑请求失败')
      console.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 获取设备当前模式（取第一个模式名作为示例）
const getDeviceMode = (deviceId) => {
  const dev = devices.value.find(d => d.id === deviceId)
  return dev && dev.modes && dev.modes.length > 0 ? dev.modes[0].name : '-'
}

onMounted(fetchPolicies)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>