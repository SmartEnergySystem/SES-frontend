import Mock from 'mockjs'

// 从旧代码中复制 Mock.mock(...) 的所有定义到这里
// 例如:
Mock.mock('/api/auth/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  if (username === 'admin' && password === 'password') {
    return {
      code: 200,
      data: { token: 'fake-admin-token', role: 'ADMIN' },
      message: '登录成功'
    }
  } else if (username === 'user' && password === 'password') {
    return {
      code: 200,
      data: { token: 'fake-user-token', role: 'USER' },
      message: '登录成功'
    }
  }
  return {
    code: 401,
    error: '用户名或密码错误',
    message: '登录失败'
  }
})

Mock.mock('/api/user/permissions', 'get', (options) => {
  const authHeader = options.custom ? options.custom.headers.Authorization : options.headers.Authorization;
  if (authHeader === 'Bearer fake-admin-token') {
    return { code: 200, data: { permissions: ["VIEW_ENERGY", "MANAGE_POLICIES", "MANAGE_USERS", "VIEW_ALERTS"] }, message: 'Success' };
  }
  return { code: 200, data: { permissions: ["VIEW_ENERGY", "MANAGE_POLICIES", "VIEW_ALERTS"] }, message: 'Success' };
});

let deviceIdCounter = 1;
const generateDeviceData = () => ({
    id: `d${deviceIdCounter++}`,
    name: Mock.Random.pick(['客厅空调', '卧室灯', '厨房冰箱', '洗衣机', '电视']),
    power: Mock.Random.integer(50, 3000), // Watts
    voltage: 220, // Volts
    current: Mock.Random.float(0, 15, 1, 2), // Amps
    status: Mock.Random.pick(['ON', 'OFF', 'STANDBY']),
    timestamp: new Date().toISOString()
});

Mock.mock('/api/telemetry/latest', 'get', () => {
    deviceIdCounter = 1; 
    return {
        code: 200,
        data: {
            devices: Array.from({ length: Mock.Random.integer(3, 5) }, generateDeviceData),
            newAlertsCount: Mock.Random.integer(0, 2) 
        },
        message: '获取最新数据成功'
    };
});

Mock.mock(RegExp('/api/analytics/history' + '.*'), 'get', (options) => {
    const historyData = [];
    const deviceNames = ['空调', '冰箱', '洗衣机', '电视', '照明'];
    for (let i = 0; i < 7; i++) { 
        historyData.push({
            date: `2025-05-${20 + i}`,
            totalConsumption: Mock.Random.float(10, 50, 1, 2), 
            devices: deviceNames.map(name => ({
                name: name,
                consumption: Mock.Random.float(1, 10, 1, 2) 
            }))
        });
    }
    return {
        code: 200,
        data: {
            periodData: historyData,
            deviceBreakdown: deviceNames.map(name => ({
                name: name,
                percentage: Mock.Random.float(10, 40, 1, 1)
            }))
        },
        message: '获取历史数据成功'
    };
});

let policyIdCounter = 1;
const policies = [
    { id: `p${policyIdCounter++}`, name: '夜间节能模式', rule: 'IF time > 22:00 THEN turn_off lights', status: 'ACTIVE', device_type: '照明', action: 'TURN_OFF', external_data_type: null, conditions: '时间 > 22:00' },
    { id: `p${policyIdCounter++}`, name: '峰谷电价策略', rule: 'IF price > 0.5 THEN turn_off water_heater', status: 'ACTIVE', device_type: '热水器', action: 'TURN_OFF', external_data_type: 'ELECTRICITY_PRICE', conditions: '电价 > 0.5元' },
];
Mock.mock('/api/policies', 'get', () => ({ code: 200, data: { policies: policies }, message: '获取策略成功' }));

Mock.mock('/api/policies', 'post', (options) => {
    const newPolicy = JSON.parse(options.body);
    newPolicy.id = `p${policyIdCounter++}`;
    newPolicy.status = 'ACTIVE'; 
    policies.push(newPolicy);
    return { code: 200, data: { policy_id: newPolicy.id, status: 'ACTIVE' }, message: '策略创建成功' };
});

Mock.mock(RegExp('/api/policies/' + '[^/]+'), 'delete', (options) => {
    const id = options.url.split('/').pop();
    const index = policies.findIndex(p => p.id === id);
    if (index !== -1) {
        policies.splice(index, 1);
        return { code: 200, data: { deleted: true }, message: '策略删除成功' };
    }
    return { code: 404, error: '策略未找到', message: '策略删除失败' };
});

let alertIdCounter = 1;
let activeAlerts = []; 
const generateAlert = () => ({
    id: `a${alertIdCounter++}`,
    device_id: `d${Mock.Random.integer(1,5)}`,
    message: Mock.Random.pick(['空调功率超标', '冰箱门未关紧', '洗衣机漏水风险']),
    severity: Mock.Random.pick(['HIGH', 'MEDIUM', 'LOW']),
    status: 'ACTIVE', 
    timestamp: new Date(Date.now() - Mock.Random.integer(0, 3600000)).toISOString(), 
    recommended_action: Mock.Random.pick(['关闭设备', '检查设备', '忽略'])
});
const resetActiveAlerts = () => {
    alertIdCounter = 1;
    activeAlerts = Array.from({length: Mock.Random.integer(1,3)}, generateAlert);
};
resetActiveAlerts(); // Initial population

Mock.mock(RegExp('/api/alerts' + '.*'), 'get', (options) => {
    // To make alerts refreshable, re-generate if specifically requested or if no alerts left
    if (options.url.includes('status=active') && activeAlerts.filter(a => a.status === 'ACTIVE').length === 0) {
         resetActiveAlerts();
    }
    return { code: 200, data: { alerts: activeAlerts.filter(a => a.status === 'ACTIVE') }, message: '获取告警成功' };
});

Mock.mock(RegExp('/api/alerts/' + '[^/]+' + '/resolve'), 'post', (options) => {
    const alertId = options.url.split('/')[3]; 
    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = 'RESOLVED'; 
        return { code: 200, data: { resolved: true, device_status_updated: true }, message: '告警已处理' };
    }
    return { code: 404, error: '告警未找到', message: '处理告警失败' };
});

// 确保模块至少有一个导出，即使为空，以符合 ES Module 规范
export default Mock;