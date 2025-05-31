<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>策略配置管理</span>
        <el-button type="primary" @click="openAddDialog" style="float: right;">新增策略</el-button>
      </div>
    </template>
    <el-table :data="policies" stripe style="width: 100%">
      <el-table-column prop="name" label="策略名称" width="180"></el-table-column>
      <el-table-column prop="device_type" label="设备类型" width="120"></el-table-column>
      <el-table-column prop="action" label="动作" width="100"></el-table-column>
      <el-table-column prop="conditions" label="条件" show-overflow-tooltip></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
                {{ scope.row.status }}
            </el-tag>
          </template>
      </el-table-column>
        <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" @close="resetForm">
      <el-form :model="policyForm" ref="policyFormRef" :rules="policyRules" label-width="120px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="policyForm.name"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="device_type">
          <el-select v-model="policyForm.device_type" placeholder="请选择设备类型">
            <el-option label="照明" value="照明"></el-option>
            <el-option label="空调" value="空调"></el-option>
            <el-option label="热水器" value="热水器"></el-option>
            <el-option label="电视" value="电视"></el-option>
          </el-select>
        </el-form-item>
          <el-form-item label="动作" prop="action">
          <el-select v-model="policyForm.action" placeholder="请选择动作">
            <el-option label="开启" value="TURN_ON"></el-option>
            <el-option label="关闭" value="TURN_OFF"></el-option>
            <el-option label="调整模式" value="ADJUST_MODE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="条件描述" prop="conditions">
          <el-input v-model="policyForm.conditions" type="textarea" placeholder="例如: 电价 > 0.5元 或 时间 > 22:00"></el-input>
        </el-form-item>
          <el-form-item label="外部数据依赖" prop="external_data_type">
          <el-select v-model="policyForm.external_data_type" placeholder="可选" clearable>
            <el-option label="电价" value="ELECTRICITY_PRICE"></el-option>
            <el-option label="天气" value="WEATHER"></el-option>
          </el-select>
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

const policyFormRef = ref(null)
const policies = ref([])
const dialogVisible = ref(false)
const policyForm = reactive({
  id: null, // 用于编辑模式
  name: '',
  device_type: '',
  action: '',
  conditions: '',
  external_data_type: null
})
const policyRules = reactive({
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  device_type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  action: [{ required: true, message: '请选择动作', trigger: 'change' }],
  conditions: [{ required: true, message: '请输入条件描述', trigger: 'blur' }],
})

const dialogTitle = computed(() => policyForm.id ? '编辑策略' : '新增策略')

const fetchPolicies = async () => {
  try {
    const response = await api.getPolicies()
    if (response.data.code === 200) {
      policies.value = response.data.data.policies
    } else {
      ElMessage.error('获取策略列表失败: ' + response.data.message)
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
  policyForm.name = ''
  policyForm.device_type = ''
  policyForm.action = ''
  policyForm.conditions = ''
  policyForm.external_data_type = null
}

const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

// 后续可以添加 openEditDialog(row) 方法

const submitPolicy = async () => {
  if (!policyFormRef.value) return
  await policyFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 此处可以根据 policyForm.id 是否存在来判断是新增还是编辑
        // 目前只实现了新增
        const response = await api.createPolicy(policyForm) // 假设编辑 API 也叫 createPolicy 或有单独的 updatePolicy
        if (response.data.code === 200) {
          ElMessage.success(policyForm.id ? '策略更新成功' : '策略创建成功')
          dialogVisible.value = false
          fetchPolicies()
        } else {
          ElMessage.error(policyForm.id ? '策略更新失败: ' : '策略创建失败: ' + response.data.message)
        }
      } catch (error) {
        ElMessage.error(policyForm.id ? '策略更新请求失败' : '策略创建请求失败')
        console.error(error)
      }
    }
  })
}

const handleDelete = (policyId) => {
  ElMessageBox.confirm('此操作将永久删除该策略, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await api.deletePolicy(policyId)
      if (response.data.code === 200) {
        ElMessage.success('策略删除成功')
        fetchPolicies()
      } else {
        ElMessage.error('策略删除失败: ' + (response.data.error || response.data.message))
      }
    } catch (error) {
      ElMessage.error('策略删除请求失败')
      console.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
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