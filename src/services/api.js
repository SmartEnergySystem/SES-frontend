import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api', // 与 Vite 开发服务器代理或 Mock.js 拦截路径一致
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Token = `${token}`
  }
  return config
})

// 从旧代码中复制并调整 API 函数
export const api = {
  login: (username, password) =>
    apiClient.post('/user/login', {
      username,
      password,
    }),
  logout: () => apiClient.post('/user/logout'),
  getLatestTelemetry: () => apiClient.get('/telemetry/latest'),
  getHistoryAnalytics: (params) => apiClient.get('/analytics/history', { params }),
  getPoliciesByDeviceId: (deviceId) => apiClient.get(`/policy/device/${deviceId}`),
  createPolicy: ({ deviceId, name }) => apiClient.post('/policy', { deviceId, name }),
  createPolicyItem: (policyItemDTO) => apiClient.post('/policyItem', policyItemDTO),
  getAlertReport: (deviceId, alertReportDto) => apiClient.post(`/device/${deviceId}/alertReport`, alertReportDto),

  // 综合控制设备（解绑策略/应用策略/切换模式/控制状态等）
  controlDevice: (deviceId, controlDTO) => apiClient.post(`/device/${deviceId}`, controlDTO),

  // 查询设备模式列表
  getDeviceModes: (deviceId) => apiClient.get(`/device/${deviceId}/mode`),

  // 控制设备模式
  setDeviceMode: (deviceId, modeId) => apiClient.post(`/device/${deviceId}/mode`, { modeId }),
  // 删除策略（解绑策略）统一用综合控制接口
  deletePolicy: (deviceId, policyId) =>
    apiClient.post(`/device/${deviceId}`, { isApplyPolicy: 0, policyId }),
  getPolicyItemsByPolicyId: (policyId) => apiClient.get(`/policyItem/policy/${policyId}`),
  getDeviceData: (idList) => apiClient.get('/device/data', { params: { idList } }),

  // 设备管理接口
  getDevicePage: (params) => apiClient.get('/device/page', { params }),
  // 新增设备 (POST /api/device)
  // deviceDTO 的格式为 { name: string, type: string }
  addDevice: (deviceDTO) => apiClient.post('/device', deviceDTO),

  // 删除设备 (DELETE /api/device/{id})
  deleteDevice: (deviceId) => apiClient.delete(`/device/${deviceId}`),

  // 修改设备名称 (PUT /api/device/{id}/name)
  editDeviceName: (deviceId, name) => apiClient.put(`/device/${deviceId}/name`, { name }),
}

// 注意：如果 Mock.js 的逻辑也放在这里，确保它只在开发环境执行
// 或者将 Mock.js 的定义移到 mockApi.js 并按需导入