import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {store} from "./store"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import VueNativeSock from "vue-native-websocket-vue3";

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(store)


// const mutations = {
//     SOCKET_ONOPEN,
//     SOCKET_ONCLOSE,
//     SOCKET_ONERROR,
//     SOCKET_ONMESSAGE,
//     SOCKET_RECONNECT,
//     SOCKET_RECONNECT_ERROR
// }

app.use(VueNativeSock, 'ws://localhost:6000', {
    store: store,
    // mutations: mutations
})

app.mount('#app')
