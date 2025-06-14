import Mock from 'mockjs'

// 从旧代码中复制 Mock.mock(...) 的所有定义到这里
// 例如:
Mock.mock('/api/user/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  if (username === 'admin' && password === 'password') {
    return {
      code: 200,
      data: {
        id: 1,
        token: 'fake-admin-token',
        username: 'admin'
      },
      message: '登录成功'
    }
  } else if (username === 'user' && password === 'password') {
    return {
      code: 200,
      data: {
        id: 2,
        token: 'fake-user-token',
        username: 'user'
      },
      message: '登录成功'
    }
  }
  return {
    code: 401,
    message: '用户名或密码错误'
  }
})

Mock.mock('/api/user/logout', 'post', () => {
  return {
    code: 200,
    data: null,
    message: '登出成功'
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

// 策略与设备类型的合理映射
const policyDeviceTypeMap = {
  '夜间节能模式': '照明',
  '峰谷电价策略': '热水器',
  '洗衣机节能策略': '洗衣机',
  '电视自动关闭': '电视'
};

let policyIdCounter = 1;
const policies = [
    {
      id: policyIdCounter++,
      name: '夜间节能模式',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '峰谷电价策略',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '洗衣机节能策略',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '电视自动关闭',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '节假日模式',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '离家自动关灯',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '高温空调降温',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    },
    {
      id: policyIdCounter++,
      name: '低温空调制热',
      createtime: Mock.Random.datetime(),
      updatetime: Mock.Random.datetime()
    }
];
// Mock.mock('/api/policies', 'get', () => ({ code: 200, data: { policies: policies }, message: '获取策略成功' }));
// 模拟：根据 deviceId 查询策略
// 查找设备类型
const getDeviceTypeById = (deviceId) => {
  const dev = allDevices.find(d => String(d.id) === String(deviceId));
  return dev ? dev.type : '';
};

Mock.mock(RegExp('/api/policy/device/' + '\\d+'), 'get', (options) => {
  const deviceId = parseInt(options.url.split('/').pop());
  const dev = allDevices.find(d => d.id === deviceId);
  let matched = [];
  if (dev) {
    if (dev.name.includes('电视')) {
      matched = policies.filter(p => ['电视自动关闭', '节假日模式'].includes(p.name));
    } else if (dev.name.includes('空调')) {
      matched = policies.filter(p => ['夜间节能模式', '高温空调降温', '低温空调制热'].includes(p.name));
    } else if (dev.name.includes('灯')) {
      matched = policies.filter(p => ['夜间节能模式', '离家自动关灯'].includes(p.name));
    } else if (dev.name.includes('洗衣机')) {
      matched = policies.filter(p => ['洗衣机节能策略'].includes(p.name));
    } else if (dev.name.includes('热水器')) {
      matched = policies.filter(p => ['峰谷电价策略'].includes(p.name));
    } else if (dev.name.includes('冰箱')) {
      matched = policies.filter(p => ['节假日模式'].includes(p.name));
    } else {
      matched = [];
    }
  }
  // 不在此处计算active，直接返回策略，active由前端根据策略条目接口判断
  const matchingPolicies = matched.map(p => ({
    id: p.id,
    name: p.name,
    createtime: p.createtime,
    updatetime: p.updatetime,
    deviceId: deviceId
    // 不带active字段
  }));
  return {
    code: 0,
    data: matchingPolicies,
    message: ''
  };
});

// 新增策略
Mock.mock('/api/policy', 'post', (options) => {
  const { deviceId, name } = JSON.parse(options.body);
  // 这里只模拟返回成功
  return { code: 0, data: '', message: '' };
});

// 新增策略条目
Mock.mock('/api/policyItem', 'post', (options) => {
  // options.body 应为 policyItemDTO，格式与文档一致
  // 返回 { code: 0, data: "", message: "" }
  return { code: 0, data: "", message: "" };
});

Mock.mock('/api/policies', 'post', (options) => {
    const newPolicy = JSON.parse(options.body);
    newPolicy.id = `p${policyIdCounter++}`;
    newPolicy.status = 'ACTIVE'; 
    policies.push(newPolicy);
    return { code: 200, data: { policy_id: newPolicy.id, status: 'ACTIVE' }, message: '策略创建成功' };
});

// 删除策略 mock，路径需与真实接口一致
Mock.mock(RegExp('/api/policy/' + '[^/]+'), 'delete', (options) => {
    const id = options.url.split('/').pop();
    // 兼容策略id为字符串、数字、带p前缀等
    const index = policies.findIndex(p =>
        String(p.id) === String(id) ||
        String(p.id) === `p${id}` ||
        String(id) === `p${p.id}`
    );
    if (index !== -1) {
        policies.splice(index, 1);
        return { code: 0, data: '', message: '策略删除成功' };
    }
    return { code: 404, data: '', message: '策略未找到' };
});

// 设备分页查询 mock
const allDevices = [
  { id: 1, name: '电视1', type: '电视', status: 'ON', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '节能模式' }, { id: 2, name: '舒适模式' }] },
  { id: 2, name: '电视2', type: '电视', status: 'OFF', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '节能模式' }, { id: 2, name: '舒适模式' }] },
  { id: 3, name: '卧室灯1', type: '卧室灯', status: 'ON', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '夜间模式' }, { id: 2, name: '阅读模式' }] },
  { id: 4, name: '卧室灯2', type: '卧室灯', status: 'OFF', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '夜间模式' }, { id: 2, name: '阅读模式' }] },
  { id: 5, name: '客厅灯1', type: '客厅灯', status: 'ON', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '夜间模式' }, { id: 2, name: '聚会模式' }] },
  { id: 6, name: '主卧空调1', type: '主卧空调', status: 'STANDBY', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '节能模式' }, { id: 2, name: '制热模式' }] },
  { id: 7, name: '阳台灯1', type: '阳台灯', status: 'ON', createtime: Mock.Random.datetime(), updatetime: Mock.Random.datetime(), modes: [{ id: 1, name: '夜间模式' }] },
  // ...如需更多设备可继续添加
];

Mock.mock(RegExp('/api/device/page.*'), 'get', (options) => {
  const url = options.url;
  const params = {};
  url.replace(/([^?&=]+)=([^&]*)/g, (_, k, v) => (params[k] = decodeURIComponent(v)));
  let records = allDevices;
  if (params.name) {
    records = records.filter(d => d.name.includes(params.name));
  }
  const page = parseInt(params.page) || 1;
  const pageSize = parseInt(params.pageSize) || 10;
  const total = records.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRecords = records.slice(start, end);

  return {
    code: 0,
    data: {
      records: pageRecords,
      total: total
    },
    message: ''
  };
});

// 查询设备模式
Mock.mock(RegExp('/api/device/' + '\\d+/mode$'), 'get', (options) => {
  const deviceId = parseInt(options.url.match(/\/api\/device\/(\d+)\/mode/)[1]);
  const dev = allDevices.find(d => d.id === deviceId);
  return {
    code: 0,
    data: dev && dev.modes ? dev.modes : [],
    message: ''
  };
});

// 控制设备模式
Mock.mock(RegExp('/api/device/' + '\\d+/mode$'), 'post', (options) => {
  // 直接返回成功
  return { code: 0, data: '', message: '' };
});

// 综合控制设备（解绑策略/应用策略/切换模式/控制状态等）
Mock.mock(RegExp('/api/device/' + '\\d+$'), 'post', (options) => {
  // 按照文档返回 { code: 0, data: "", message: "" }
  return {
    code: 0,
    data: "",
    message: ""
  };
});

// 查询策略API（每个设备返回与其类型相关的合理策略，并且策略条目和激活状态分离）
Mock.mock(RegExp('/api/policy/device/' + '\\d+'), 'get', (options) => {
  const deviceId = parseInt(options.url.split('/').pop());
  const dev = allDevices.find(d => d.id === deviceId);
  let matched = [];
  if (dev) {
    if (dev.name.includes('电视')) {
      matched = policies.filter(p => ['电视自动关闭', '节假日模式'].includes(p.name));
    } else if (dev.name.includes('空调')) {
      matched = policies.filter(p => ['夜间节能模式', '高温空调降温', '低温空调制热'].includes(p.name));
    } else if (dev.name.includes('灯')) {
      matched = policies.filter(p => ['夜间节能模式', '离家自动关灯'].includes(p.name));
    } else if (dev.name.includes('洗衣机')) {
      matched = policies.filter(p => ['洗衣机节能策略'].includes(p.name));
    } else if (dev.name.includes('热水器')) {
      matched = policies.filter(p => ['峰谷电价策略'].includes(p.name));
    } else if (dev.name.includes('冰箱')) {
      matched = policies.filter(p => ['节假日模式'].includes(p.name));
    } else {
      matched = [];
    }
  }
  // 不在此处计算active，直接返回策略，active由前端根据策略条目接口判断
  const matchingPolicies = matched.map(p => ({
    id: p.id,
    name: p.name,
    createtime: p.createtime,
    updatetime: p.updatetime,
    deviceId: deviceId
    // 不带active字段
  }));
  return {
    code: 0,
    data: matchingPolicies,
    message: ''
  };
});

// 策略条目 mock 数据
const policyItemsMap = {
  1: [
    {
      id: 1,
      policyId: 1,
      modeId: 1,
      // 当前时间段内（比如8:00-23:59）
      startTime: { hour: 8, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 23, minute: 59, second: 59, nano: 0 }
    }
  ],
  2: [
    {
      id: 2,
      policyId: 2,
      modeId: 2,
      // 当前时间段外（比如0:00-1:00）
      startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 1, minute: 0, second: 0, nano: 0 }
    }
  ],
  3: [
    {
      id: 3,
      policyId: 3,
      modeId: 1,
      // 跨越当前时间段（比如0:00-23:59，始终激活）
      startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 23, minute: 59, second: 59, nano: 0 }
    }
  ],
  4: [
    {
      id: 4,
      policyId: 4,
      modeId: 1,
      // 当前时间段外
      startTime: { hour: 2, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 3, minute: 0, second: 0, nano: 0 }
    }
  ],
  5: [
    {
      id: 5,
      policyId: 5,
      modeId: 1,
      // 当前时间段内
      startTime: { hour: 7, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 22, minute: 0, second: 0, nano: 0 }
    }
  ],
  6: [
    {
      id: 6,
      policyId: 6,
      modeId: 1,
      // 当前时间段外
      startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 1, minute: 0, second: 0, nano: 0 }
    }
  ],
  7: [
    {
      id: 7,
      policyId: 7,
      modeId: 1,
      // 当前时间段内
      startTime: { hour: 6, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 23, minute: 0, second: 0, nano: 0 }
    }
  ],
  8: [
    {
      id: 8,
      policyId: 8,
      modeId: 1,
      // 当前时间段外
      startTime: { hour: 0, minute: 0, second: 0, nano: 0 },
      endTime: { hour: 1, minute: 0, second: 0, nano: 0 }
    }
  ]
  // 可继续添加更多策略条目
};

Mock.mock(RegExp('/api/policyItem/policy/\\d+$'), 'get', (options) => {
  const policyId = parseInt(options.url.split('/').pop());
  const items = policyItemsMap[policyId] || [];
  return {
    code: 0,
    data: items,
    message: ''
  };
});

// 新增代码：设备当前状态查询接口
Mock.mock(RegExp('/api/device/data.*'), 'get', (options) => {
  // 解析 idList 参数
  let idList = [];
  if (options.url.includes('idList=')) {
    const match = options.url.match(/idList=([^&]*)/);
    if (match && match[1]) {
      idList = match[1].split(',').map(id => parseInt(id));
    }
  }
  // 生成 mock 数据
  const data = (idList.length ? idList : [1,2,3]).map(id => ({
    deviceId: id,
    isRealTime: 1,
    lastUpdatedTime: new Date().toISOString(),
    modeName: id === 1 ? '节能模式' : id === 2 ? '舒适模式' : '夜间模式',
    policyName: id === 1 ? '夜间节能模式' : id === 2 ? '节假日模式' : '高温空调降温',
    power: 100 + id * 10,
    status: 1 // 1=开，0=关
  }));
  return {
    code: 0,
    data,
    message: ''
  };
});

let alertIdCounter = 1;
let alertReports = [];

// 生成单个告警报告
const generateAlertReport = (deviceId) => ({
  id: `a${alertIdCounter++}`,
  deviceId,
  level: Mock.Random.integer(0, 2), // 0=低, 1=中, 2=高
  message: Mock.Random.pick([
    '设备功率超标',
    '设备温度异常',
    '设备通信中断',
    '设备运行时间过长'
  ]),
  modeName: Mock.Random.pick(['节能模式', '舒适模式', '夜间模式', '制热模式']),
  policyName: Mock.Random.pick([
    '夜间节能模式',
    '高温空调降温',
    '节假日模式',
    '离家自动关灯'
  ]),
  status: Mock.Random.integer(0, 2), // 0=未处理, 1=已处理, 2=忽略
  timestamp: new Date(Date.now() - Mock.Random.integer(0, 7 * 24 * 60 * 60 * 1000)).toISOString() // 随机过去7天
});

// 初始化告警数据
const resetAlertReports = () => {
  alertIdCounter = 1;
  alertReports = [];
  allDevices.forEach(device => {
    const count = Mock.Random.integer(0, 3); // 每个设备0-3条告警
    for (let i = 0; i < count; i++) {
      alertReports.push(generateAlertReport(device.id));
    }
  });
};
resetAlertReports();

// Mock 告警报告接口
Mock.mock(RegExp('/api/device/\\d+/alertReport'), 'post', (options) => {
  const deviceId = parseInt(options.url.match(/\/api\/device\/(\d+)\/alertReport/)[1]);
  const dto = JSON.parse(options.body || '{}');
  const { startTime, endTime } = dto;

  // 过滤告警数据
  let filteredReports = alertReports.filter(report => String(report.deviceId) === String(deviceId));

  // 按时间范围过滤（如果提供）
  if (startTime && endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    filteredReports = filteredReports.filter(report => {
      const timestamp = new Date(report体系).getTime();
      return timestamp >= start && timestamp <= end;
    });
  }

  return {
    code: 0,
    data: {
      alertReports: filteredReports,
      total: filteredReports.length
    },
    message: ''
  };
}); 


// 确保模块至少有一个导出，即使为空，以符合 ES Module 规范
export default Mock;