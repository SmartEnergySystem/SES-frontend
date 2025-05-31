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
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 从旧代码中复制并调整 API 函数
export const api = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  getUserPermissions: () => apiClient.get('/user/permissions'),
  getLatestTelemetry: () => apiClient.get('/telemetry/latest'),
  getHistoryAnalytics: (params) => apiClient.get('/analytics/history', { params }),
  getPolicies: () => apiClient.get('/policies'),
  createPolicy: (policyData) => apiClient.post('/policies', policyData),
  deletePolicy: (policyId) => apiClient.delete(`/policies/${policyId}`),
  getAlerts: (params) => apiClient.get('/alerts', { params }),
  resolveAlert: (alertId, actionData) => apiClient.post(`/alerts/${alertId}/resolve`, actionData)
}

// 注意：如果 Mock.js 的逻辑也放在这里，确保它只在开发环境执行
// 或者将 Mock.js 的定义移到 mockApi.js 并按需导入