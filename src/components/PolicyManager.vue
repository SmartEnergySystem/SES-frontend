```vue
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
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button-group>
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">新增条目</el-button>
            <el-button size="small" type="info" @click="openDetailDialog(scope.row)">详情</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id, scope.row.device_id)">解绑</el-button>
          </el-button-group>
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

    <!-- 新增策略对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" @close="resetForm">
      <el-form :model="policyForm" ref="policyFormRef" :rules="policyRules" label-width="120px">
        <el-form-item label="设备" prop="deviceId">
          <el-select v-model="policyForm.deviceId" placeholder="请选择设备">
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPolicy">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增策略条目对话框 -->
    <el-dialog title="新增策略条目" v-model="editDialogVisible" width="50%" @close="resetEditForm">
      <el-form :model="editForm" ref="editFormRef" :rules="editRules" label-width="120px">
        <el-form-item label="策略名称">
          <el-input v-model="editForm.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="模式" prop="modeId">
          <el-select v-model="editForm.modeId" placeholder="请选择模式" :disabled="!modeList.length">
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
            v-model="editForm.startTime"
            placeholder="选择开始时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="editForm.endTime"
            placeholder="选择结束时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPolicyItem">添加策略条目</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 策略条目详情对话框 -->
    <el-dialog title="策略条目详情" v-model="detailDialogVisible" width="60%">
      <el-table :data="policyItems" stripe style="width: 100%">
        <el-table-column prop="modeName" label="模式名称" width="150"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="150"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDeletePolicyItem(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../services/api'

const policyFormRef = ref(null)
const editFormRef = ref(null)
const policies = ref([])
const dialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const modeList = ref([])
const devices = ref([])
const deviceStatusMap = ref({})
const policyItems = ref([])

const policyForm = reactive({
  deviceId: null,
  name: ''
})
const policyRules = reactive({
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }]
})

const editForm = reactive({
  policyId: null,
  deviceId: null,
  name: '',
  modeId: null,
  startTime: '',
  endTime: ''
})
const editRules = reactive({
  modeId: [{ required: true, message: '请选择模式', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
})

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const pagedPolicies = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return policies.value.slice(start, start + pageSize.value)
})

const dialogTitle = computed(() => '新增策略')

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
    if (deviceRes.data.code === 1 && deviceRes.data.data.records.length > 0) {
      devices.value = deviceRes.data.data.records
    } else {
      ElMessage.info('暂无设备，无法查询策略')
      policies.value = []
      return
    }
    const policyResults = await Promise.all(
      devices.value.map(dev => api.getPoliciesByDeviceId(dev.id).then(res => ({ res, dev })))
    )
    let policyList = []
    policyResults.forEach(({ res, dev }) => {
      if (res.data.code === 1 && Array.isArray(res.data.data)) {
        policyList = policyList.concat(
          res.data.data.map(p => ({
            ...p,
            device_name: dev.name,
            device_id: dev.id
          }))
        )
      }
    })
    const now = new Date()
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    const withItems = await Promise.all(policyList.map(async (policy) => {
      const itemsRes = await api.getPolicyItemsByPolicyId(policy.id)
      let active = false
      if (itemsRes.data.code === 1 && Array.isArray(itemsRes.data.data)) {
        active = itemsRes.data.data.some(item => {
          const [startHour, startMinute, startSecond] = (item.startTime || '00:00:00').split(':').map(Number)
          const [endHour, endMinute, endSecond] = (item.endTime || '00:00:00').split(':').map(Number)
          const start = startHour * 3600 + startMinute * 60 + startSecond
          const end = endHour * 3600 + endMinute * 60 + endSecond
          return nowSeconds >= start && nowSeconds <= end
        })
      }
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
  policyForm.deviceId = null
  policyForm.name = ''
}

const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  editForm.policyId = null
  editForm.deviceId = null
  editForm.name = ''
  editForm.modeId = null
  editForm.startTime = ''
  editForm.endTime = ''
}

const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (policy) => {
  resetEditForm()
  editForm.policyId = policy.id
  editForm.deviceId = policy.device_id
  editForm.name = policy.name
  try {
    const res = await api.getDeviceModes(policy.device_id)
    if (res.data.code === 1 && Array.isArray(res.data.data)) {
      modeList.value = res.data.data
    } else {
      modeList.value = []
    }
  } catch (e) {
    modeList.value = []
  }
  editDialogVisible.value = true
}

const openDetailDialog = async (policy) => {
  try {
    const res = await api.getPolicyItemsByPolicyId(policy.id)
    if (res.data.code === 1 && Array.isArray(res.data.data)) {
      // 假设 modeName 需通过 getDeviceModes 获取
      const modeRes = await api.getDeviceModes(policy.device_id)
      const modeMap = new Map(modeRes.data.code === 1 ? modeRes.data.data.map(m => [m.id, m.name]) : [])
      policyItems.value = res.data.data.map(item => ({
        ...item,
        modeName: modeMap.get(item.modeId) || '未知模式'
      }))
    } else {
      policyItems.value = []
      ElMessage.info('该策略暂无条目')
    }
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取策略条目失败')
    console.error(error)
  }
}

const submitPolicy = async () => {
  if (!policyFormRef.value) return
  await policyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await api.createPolicy({
          deviceId: policyForm.deviceId,
          name: policyForm.name
        })
        if (response.data.code === 1 || response.data.code === 200) {
          ElMessage.success('策略创建成功')
          dialogVisible.value = false
          fetchPolicies()
        } else {
          ElMessage.error('策略创建失败')
        }
      } catch (error) {
        ElMessage.error('策略创建请求失败')
        console.error(error)
      }
    }
  })
}

const submitPolicyItem = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await api.createPolicyItem({
          policyId: editForm.policyId,
          modeId: editForm.modeId,
          startTime: editForm.startTime, // "HH:mm:ss"
          endTime: editForm.endTime // "HH:mm:ss"
        })
        if (response.data.code === 1 || response.data.code === 200) {
          ElMessage.success('策略条目添加成功')
          editDialogVisible.value = false
          fetchPolicies()
        } else {
          ElMessage.error('策略条目添加失败')
        }
      } catch (error) {
        ElMessage.error('策略条目添加请求失败')
        console.error(error)
      }
    }
  })
}

const handleDelete = async (policyId, deviceId) => {
  ElMessageBox.confirm('此操作将解绑该策略, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.deletePolicy(policyId)
      if (response.data.code === 1 || response.data.code === 200) {
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

const handleDeletePolicyItem = (policyItemId) => {
  ElMessageBox.confirm('此操作将删除该策略条目, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.deletePolicyItem(policyItemId)
      if (response.data.code === 1 || response.data.code === 200) {
        ElMessage.success('策略条目删除成功')
        // 刷新策略条目列表
        const policy = policies.value.find(p => p.id === editForm.policyId)
        if (policy) {
          await openDetailDialog(policy)
        }
        fetchPolicies()
      } else {
        ElMessage.error('策略条目删除失败: ' + (response.data.error || response.data.message))
      }
    } catch (error) {
      ElMessage.error('策略条目删除请求失败')
      console.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
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