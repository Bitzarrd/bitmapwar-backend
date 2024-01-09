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
import {decompress2, decompress3,decompress4} from "bitmap_sdk";
import axios from "axios";
// import * as abi from "./bitcraft_abi.json";
import {ethers} from "ethers";
import {ElMessage} from "element-plus";

const abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "burnFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "BuyToken",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawETH",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            }
        ],
        "name": "withdrawETHWithSignature",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "usedNonces",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
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
        wallet_address: null,
        contract: null,
        ///////////
        loading: true,
        game_started: 0,
        new_player: null,
        new_update: null,
        players: [],
        grid: [],
        map_list: [],
        turn: 0,
        next_round: 0,

        gridWidth: 1000,
        gridHeight: 1000,
        cellSize: 10,
        stop_time: 0,

        settlement: null,

        landList: [
            {
                team: "red",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "yellow",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "green",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "purple",
                land: 0,
                virus: 0,
                loss: 0
            }
        ],
        settlementLandList: [
            {
                team: "red",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "yellow",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "green",
                land: 0,
                virus: 0,
                loss: 0
            },
            {
                team: "purple",
                land: 0,
                virus: 0,
                loss: 0
            }
        ],
        lastRanking: [],

        user: {
            address: null,
            profit: "0",
            virus: 0,
        },
        pending_extract: null,
        extracts: [],
        purchase: [],

        /////////////////////
        actionDialogVisible: false,
        purchaseDialogVisible: false,
        bitmapListDialogVisible: false,
        profitDialogVisible: false,
        nextRoundSettingDialogVisible: false,
        // settlementDialogVisible: false,
        walletsDialogVisible: false,
        selected_map: "",
        selected_color: "red",
        virus: 0,
        jackpot: "0",
        jackpotLightUp: null,
        server_time_delta: 0//服务器时差
    },
    getters: {},
    mutations: {
        // setExtract(state, value): {
        //     state.extracts = value;
        // },
        setSelectColor(state, value) {
            state.selected_color = value;
        },
        setVirus(state, value) {
            state.virus = value
        },
        setSelectedMap(state, value) {
            state.selected_map = value;
        },
        setActionDialogVisible(state, value) {
            state.actionDialogVisible = value;
        },
        setPurchaseDialogVisible(state, value) {
            state.purchaseDialogVisible = value
        },
        setBitmapListDialogVisible(state, value) {
            state.bitmapListDialogVisible = value
        },
        setProfitDialogVisible(state, value) {
            state.profitDialogVisible = value
        },
        setNextRoundSettingDialogVisible(state, value) {
            state.nextRoundSettingDialogVisible = value
        },
        // setSettlementDialogVisible(state, value) {
        //     state.settlementDialogVisible = value
        // },
        setWalletsDialogVisible(state, value) {
            state.walletsDialogVisible = value
        },
        setWalletAddress(state, address) {
            state.wallet_address = address;
        },
        setContract(state, contract) {
            state.contract = contract;
        },
        setMapList(state, list) {
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
            state.loading = true;
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
                case "ShareSuccess":
                    ElMessage.info(
                        {
                            message: "Thank you for sharing. Your soldier has been credited to your account.",
                            duration: 10000
                        }
                    );

                    state.user = message.user;
                    break;
                case "Reload":
                    state.stop_time = message.stop_time;
                    state.landList = message.statistics;
                    state.next_round = message.next_round;
                    state.turn = message.turn;
                    state.gridWidth = message.gridWidth;
                    state.gridHeight = message.gridHeight;
                    state.grid = decompress4(message.grid, message.gridWidth, message.gridHeight);
                    state.players = message.players;
                    console.log("state.grid", state.grid);
                    state.lastRanking = message.last_rank;
                    state.jackpot = message.jackpot;
                    state.loading = false;

                    const server_time = message.now_time;
                    const local_time = Math.floor(new Date().getTime() / 1000);

                    state.server_time_delta = local_time - server_time;

                    console.log("server_time_delta", state.server_time_delta);

                    break;
                case "GameStarted":
                    state.stop_time = message.stop_time;
                    state.turn = message.turn;
                    state.players = message.players;
                    state.game_started = message.start_time;
                    break;
                case "GameStopped":
                    state.game_started = 0;
                    state.turn = 0;
                    state.next_round = 0;
                    state.stop_time = 0;
                    state.players = [];
                    break;
                case "JoinedGameSuccess":
                    state.new_player = message.player;
                    state.players.push(message.player);
                    state.user = message.user;
                    state.jackpot = message.jackpot;
                    break;
                case "Update":
                    state.turn = message.turn;
                    state.landList = message.statistics;
                    state.new_update = message.payload;
                    break;
                case "LoginSuccess":
                    console.log("LoginSuccess", message);
                    state.user = message.user;
                    state.extracts = message.extracts;
                    state.purchase = message.purchase;

                    if (message.has_login_gift) {
                        ElMessage.info(
                            {
                                message: "Thank you for participating in BitmapWar. You have received 500 soldiers to help you participate in the game.",
                                duration: 10000
                            }
                        )
                    }

                    break;
                case "SetNextRoundSuccess":
                    state.next_round = (Number)(message.next_round);
                    state.turn = message.turn;
                    break;
                case "Settlement":
                    state.next_round = (Number)(message.next_round);
                    state.settlement = {
                        rank: message.rank,
                        statistics: message.statistics,
                        earning: message.earning
                    }
                    state.user = message.user;
                    state.lastRanking = message.rank;
                    state.settlementLandList = state.landList;
                    state.landList = [
                        {
                            team: "red",
                            land: 0,
                            virus: 0,
                            loss: 0
                        },
                        {
                            team: "yellow",
                            land: 0,
                            virus: 0,
                            loss: 0
                        },
                        {
                            team: "green",
                            land: 0,
                            virus: 0,
                            loss: 0
                        },
                        {
                            team: "purple",
                            land: 0,
                            virus: 0,
                            loss: 0
                        }
                    ];
                    state.turn = 0;
                    state.players = [];
                    // state.settlementDialogVisible = true;
                    break;
                case "PurchaseSuccess":
                    state.user = message.user;
                    break;
                case "ExtractProfitSuccess":
                    state.pending_extract = {
                        amount: message.amount,
                        nonce: message.nonce,
                        signature: message.signature
                    };

                    state.extracts.unshift({
                        id: message.nonce,
                        amount: message.amount,
                        create_time: message.create_time,
                        status: 0,
                        signature: message.signature
                    })

                    state.user = message.user;
                    break;
                case "UpdateExtractSuccess":
                    for (let i = 0; i < state.extracts.length; i++) {
                        if (state.extracts[i].id === message.id) {
                            state.extracts[i].status = 1;
                            state.extracts[i].txid = message.txid;
                            break;
                        }
                    }
                    break;
                case "JackpotLightUp":
                    state.jackpotLightUp = {
                        team: message.team,
                        land: message.land,
                        jackpot: message.jackpot,
                        user: message.user
                    }
                    if (message.user.address === state.user.address) {
                        state.user = message.user
                    }
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
    actions: {
        async connectUnisat(context) {
            if (typeof window.unisat !== 'undefined') {
                // alert('UniSat Wallet is installed!');
                let account = await window.unisat.requestAccounts();
                console.log("account", account);
                context.commit('setWalletAddress', account[0])
            }
        },

        async connectMetaMask(context) {
            try {
                await window.ethereum.enable();
                const account = await window.ethereum.request({method: 'eth_requestAccounts'});
                context.commit('setWalletAddress', account[0])


                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner();

                console.log("abi", abi);
                const contractAddress = '0x930195D579bc6Cb868b5515964dd75E6718Ec555';

                const contract = new ethers.Contract(contractAddress, abi, signer);

                context.commit('setContract', contract)

            } catch (error) {
                console.error(error)
                // Handle error
            }
        },

        async getBitMapList(context) {
            let url = "https://global.bitmap.game/service/open/bitmap/list?address=bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z";
            let result = await axios.get(url);
            console.log("getBitMapList result.data.data.list", result.data.data.list);
            context.commit('setMapList', result.data.data.list)
        },
        async login(context, wallet_address) {
            console.log("login", wallet_address)
            context.state.conn.sendObj({
                method: "Login",
                address: wallet_address
            })
        }
    },
    modules: {}
});