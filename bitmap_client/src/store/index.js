import {createStore} from "vuex";
import main from "../main";
import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from "./mutation-types"

export const store = createStore({
    state: {
        conn: null,
        socket: {
            // 连接状态
            isConnected: false,
            // 消息内容
            message: "",
            // 重新连接错误
            reconnectError: false,
            // 心跳消息发送时间
            heartBeatInterval: 50000,
            // 心跳定时器
            heartBeatTimer: 0
        },
        game_started: false,
    },
    mutations: {
        // 连接打开
        [SOCKET_ONOPEN](state, event) {
            console.log("SOCKET_ONOPEN")
            // console.log(event.currentTarget);
            main.config.globalProperties.$socket = event.currentTarget;
            state.conn = event.currentTarget;
            state.socket.isConnected = true;
            // 连接成功时启动定时发送心跳消息，避免被服务器断开连接
            state.socket.heartBeatTimer = setInterval(() => {
                const message = "心跳消息";
                state.socket.isConnected &&
                main.config.globalProperties.$socket.sendObj({
                    code: 200,
                    msg: message
                });
            }, state.socket.heartBeatInterval);
        },
        // 连接关闭
        [SOCKET_ONCLOSE](state, event) {
            console.log("连接已断开: " + new Date());
            state.socket.isConnected = false;
            // 连接关闭时停掉心跳消息
            clearInterval(state.socket.heartBeatTimer);
            state.socket.heartBeatTimer = 0;
            console.log(event);
        },
        // 发生错误
        [SOCKET_ONERROR](state, event) {
            console.error(state, event);
        },
        // 收到服务端发送的消息
        [SOCKET_ONMESSAGE](state, message) {
            console.log("SOCKET_ONMESSAGE", message);
            switch (message.method) {
                case "GameStarted":
                    state.game_started = true;
                    break;
                case "GameStopped":
                    state.game_started = false;
                    break;

            }
            state.socket.message = message;
        },
        // 自动重连
        [SOCKET_RECONNECT](state, count) {
            console.info("消息系统重连中...", state, count);
        },
        // 重连错误
        [SOCKET_RECONNECT_ERROR](state) {
            state.socket.reconnectError = true;
        }
    },

    modules: {}
});