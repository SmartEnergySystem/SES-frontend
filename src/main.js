import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/base.css' // 如果有全局基础样式
// 如果有其他全局样式，也在这里引入，例如：
// import './assets/main.css'

// 引入 Mock API (仅在开发环境)
import './services/mockApi'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')