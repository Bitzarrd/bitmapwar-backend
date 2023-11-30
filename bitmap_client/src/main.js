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


app.mount('#app')


import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from './store/mutation-types'

const mutations = {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
}

// app.use(VueNativeSock, 'ws://127.0.0.1:3000', {
app.use(VueNativeSock, 'ws://34.225.3.60:3000', {
    mutations: mutations,
    // 启用Vuex集成
    store: store,
    // 数据发送/接收使用使用json
    format: "json",
    // 开启手动调用 connect() 连接服务器
    connectManually: false,
    // 关闭自动重连
    reconnection: false    // mutations: mutations
})

export default app;