import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

//引入默认样式
import './assets/css/common.css'

// 引入的element组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// 引入的axios组件
import axios from 'axios'
import VueAxios from 'vue-axios'

// 引入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

//引入vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

new Vue({
  router,
  store,
  render: function (h) {
    return h(App)
  }
}).$mount('#app')