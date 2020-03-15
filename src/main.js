import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './plugins/element.js'
// 引用全局通用样式
import './assets/css/global.css'
//引入字体图标文件
import './assets/fonts/iconfont.css'
// 配置请求根路径
import axios from 'axios'
// 导入全局样式表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入全局样式编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 设置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//设置请求拦截器，添加token为后面请求api
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 定义全局时间过滤器
Vue.filter('dateFormat',function(originVal){
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2,'0')
    const d = (dt.getDate() + '').padStart(2,'0')

    const hh = (dt.getHours() + '').padStart(2,'0')
    const mm = (dt.getMinutes() + '').padStart(2,'0')
    const ss = (dt.getSeconds() + '').padStart(2,'0')

    return `${y}-${m}-${d}-${hh}-${mm}-${ss}`
})
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
