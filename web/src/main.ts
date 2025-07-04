import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
// import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './index.css'
// 导入自定义主题样式，确保它在 Element Plus 样式之后导入以覆盖默认样式
import './assets/theme.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

app.use(createPinia())
// app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
})

app.mount('#app')
