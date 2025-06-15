<template>
  <div class="device-list">
    <div class="device-list-header">
      <h2>设备管理</h2>
      <el-button type="primary" @click="goToAddDevice">
        <el-icon><Plus /></el-icon>
        添加设备
      </el-button>
    </div>

    <el-card class="device-list-content">
      <el-table
        v-loading="loading"
        :data="deviceList"
        style="width: 100%"
      >
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="type" label="设备类型" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="editDevice(scope.row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteDevice(scope.row)"
              >删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { api } from '@/services/api'

const router = useRouter()
const loading = ref(false)
const deviceList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取设备列表
const fetchDevices = async () => {
  loading.value = true
  try {
    const response = await api.getDevicePage({
      page: currentPage.value,
      pageSize: pageSize.value
    })

    // The backend wraps the response. Check the 'code' for success.
    if (response.data && response.data.code === 1) {
      // The actual list is in response.data.data.records
      if (response.data.data && Array.isArray(response.data.data.records)) {
        deviceList.value = response.data.data.records
        total.value = response.data.data.total || 0
      } else {
        // This case might happen if backend returns code:0 but no data object.
        deviceList.value = []
        total.value = 0
        console.warn("API reported success but data format is unexpected.", response.data);
      }
    } else {
      // Handle API error reported in the response body
      ElMessage.error(response.data.message || '获取设备列表失败')
      console.error('API returned an error:', response.data);
      deviceList.value = [];
      total.value = 0;
    }
  } catch (error) {
    ElMessage.error('获取设备列表失败: 网络或请求错误')
    console.error('获取设备列表出错:', error.response || error);
  } finally {
    loading.value = false
  }
}

// 跳转到添加设备页面
const goToAddDevice = () => {
  router.push('/device/add')
}

// 编辑设备
const editDevice = (device) => {
  // TODO: 实现编辑功能
  console.log('编辑设备:', device)
}

// 删除设备
const deleteDevice = async (device) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await api.deleteDevice(device.id)
    ElMessage.success('设备删除成功')
    fetchDevices() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('设备删除失败')
      console.error('删除设备出错:', error)
    }
  }
}

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchDevices()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchDevices()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.device-list {
  padding: 20px;
}

.device-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.device-list-content {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 