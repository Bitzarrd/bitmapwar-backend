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
import {decompress2} from "bitmap_sdk";
import axios from "axios";

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
        ///////////
        loading: true,
        game_started: false,
        new_player: null,
        new_update: null,
        players: [],
        grid: [],
        wallet_address: null,
        map_list:[],

        gridWidth: 1000,
        gridHeight: 300,
        cellSize: 20,
    },
    mutations: {
        setWalletAddress(state, address) {
            state.wallet_address = address;
        },
        setMapList(state,list){
            state.map_list = list
        },
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
                case "Reload":
                    state.gridWidth = message.gridWidth;
                    state.gridHeight = message.gridHeight;
                    state.grid = decompress2(message.grid);
                    state.players = message.players;
                    state.loading = false;
                    break;
                case "GameStarted":
                    state.game_started = true;
                    break;
                case "GameStopped":
                    state.game_started = false;
                    break;
                case "JoinedGame":
                    state.new_player = message.player;
                    break;
                case "Update": {
                    state.new_update = message.payload;
                }

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
    actions: {
        async connectWallet(context) {
            if (typeof window.unisat !== 'undefined') {
                // alert('UniSat Wallet is installed!');
                let account = await window.unisat.requestAccounts();
                console.log(account);
                context.commit('setWalletAddress', account[0])

            }
        },
        async getBitMapList(context) {
            let url = "https://develop.oasis.world/service/open/bitmap/list?address=bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z";
            let result = await axios.get(url);
            console.log(result.data.data.list);
            context.commit('setMapList', result.data.data.list)
        }
    },
    modules: {}
});