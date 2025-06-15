<template>
  <div class="device-add">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>新增设备</h2>
        </div>
      </template>
      
      <el-form 
        :model="form" 
        :rules="rules"
        ref="formRef"
        label-width="120px"
        class="device-form"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input 
            v-model="form.name"
            placeholder="请输入设备名称"
          />
        </el-form-item>
        
        <el-form-item label="设备类型" prop="type">
          <el-input 
            v-model="form.type"
            placeholder="请输入设备类型"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">创建设备</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '@/services/api'

const router = useRouter()
const formRef = ref(null)

const form = reactive({
  name: '',
  type: ''
})

const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请输入设备类型', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

const onSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    await api.addDevice({
      name: form.name,
      type: form.type
    })
    
    ElMessage.success('设备添加成功')
    router.push('/device/list') // 假设设备列表页的路由是这个
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('设备添加失败')
    }
    console.error('添加设备出错:', error)
  }
}

const onCancel = () => {
  router.back()
}
</script>

<style scoped>
.device-add {
  padding: 20px;
}

.form-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-form {
  margin-top: 20px;
}
</style> 