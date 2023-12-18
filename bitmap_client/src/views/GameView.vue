<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";
import {CirclePlus, Edit, Histogram, Rank} from "@element-plus/icons-vue";
import {shortend} from "@/utils";
import {ethers, formatEther} from "ethers";
import CountDown from "@/components/CountDown.vue";
import NextRound from "@/components/NextRound.vue";
import {ElMessage} from "element-plus";
import LastRanking from "@/components/LastRanking.vue";
import LandList from "@/components/LandList.vue";
import UserInfo from "@/components/UserInfo.vue";
import Action from "@/components/Action.vue";
import ActionDialog from "@/components/dialogs/ActionDialog.vue";
import ProfitDialog from "@/components/dialogs/ProfitDialog.vue";
import BitmapListDialog from "@/components/dialogs/BitmapListDialog.vue";
import NextRoundSettingDialog from "@/components/dialogs/NextRoundSettingDialog.vue";
import SettlementDialog from "@/components/dialogs/SettlementDialog.vue";
import WalletsDialog from "@/components/dialogs/WalletsDialog.vue";
import PurchaseDialogV from "@/components/dialogs/PurchaseDialog.vue";
import PurchaseDialog from "@/components/dialogs/PurchaseDialog.vue";
import JackPot from "@/components/JackPot.vue";

export default {
  name: "GameView",
  components: {
    JackPot,
    PurchaseDialog,
    PurchaseDialogV,
    WalletsDialog,
    SettlementDialog,
    NextRoundSettingDialog,
    BitmapListDialog,
    ProfitDialog,
    ActionDialog,
    Action,
    UserInfo, LandList, LastRanking, Edit, Histogram, Rank, CirclePlus, MapRender, CountDown, NextRound
  },
  computed: {
    ...mapState([
      'socket', 'conn', 'wallet_address', 'map_list', 'turn',
      'landList', 'user', 'gridWidth',
      'cellSize', 'loading', 'contract'
    ]),
  },
  data() {
    return {
      scaleValue: 1,
      purchaseLoading: false,
      nextRoundSetting: 0,
      searched_map: null,
    }
  },
  mounted() {
    // 添加鼠标滚轮事件监听器
    let resizeable = document.getElementById('gridCanvas');

    resizeable.addEventListener('wheel', () => {
      event.preventDefault();
      const delta = event.deltaY;
      const scaleFactor = 1; // 缩放因子
      const scaleMultiplier = delta > 0 ? 1 - scaleFactor : 1 + scaleFactor;
      if (scaleMultiplier === 0) {
        this.scaleValue -= 0.1;
      }

      if (scaleMultiplier === 2) {
        this.scaleValue += 0.1;
      }

      if (this.scaleValue < 0.1) {
        this.scaleValue = 0.02;
      }
      if (this.scaleValue > 5) {
        this.scaleValue = 5;
      }
    });

  },
  watch: {},
  methods: {
    formatEther,
    ...mapActions(['getBitMapList', 'login']),
    ...mapMutations(['setWalletsDialogVisible',]),
    ...mapMutations([]),
    onClickStartGame() {
      this.conn.sendObj({method: "StartGame"});
    },
    onClickStopGame() {
      this.conn.sendObj({method: "StopGame"});
    },
    onClickJoinGame() {
      this.conn.sendObj({method: "JoinGame"});
    },
    innerStyle() {
      let scale = this.scaleValue;
      return `scale: ${scale};`;
    },
    search(map_id) {
      console.log("search for map_id:", map_id);
      this.scaleValue = 1;
      const render = this.$refs.render;
      const middle = this.$refs.middle;
      const middle_width = middle.offsetWidth;
      const middle_height = middle.offsetHeight;
      console.log("middle", middle_width, middle_height);
      render.search(middle_width, middle_height - 50, map_id);
    },
    handleSearchEnter() {
      console.log("handleSearchEnter", this.searched_map);
      this.search(this.searched_map);
    },
  }
}
</script>

<template>
  <div class="container" v-loading="loading">
    <div class="top-div">
      <span style="margin-right: 10px;">Socket Connect: {{ socket.isConnected ? "YES" : socket.reconnectError }}</span>
      <el-button @click="onClickJoinGame">Join Game</el-button>
      <el-button @click="onClickStartGame">Start Game</el-button>
      <el-button @click="onClickStopGame">Stop Game</el-button>
      <el-button @click="nextRoundSettingDialogVisible = true">Set Next Round</el-button>
      <div style="float: right">
        <el-button @click="setWalletsDialogVisible(true)">{{
            wallet_address ? wallet_address : "Conn Wallet"
          }}
        </el-button>
      </div>
    </div>
    <div class="bottom-div" id="bottom-div">
      <div class="box">
        <div class="left">
          <LandList/>
          <LastRanking/>
        </div>
        <div class="middle" ref="middle">
          <div class="round">
            <div style="float: left;padding-top: 12px;color: #E5EAF3">
              <CountDown/>
              <NextRound/>
              Turn:{{ turn }}
              <JackPot/>
            </div>
            <div style="float: right;margin-top: 10px">
              <el-input size="small" placeholder="Search Bitmap" v-model="searched_map"
                        @keyup.enter="handleSearchEnter">
                <template #prepend>
                  <el-button>
                    <el-icon color="white" class="no-inherit">
                      <Search/>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
          <div id="resizeable" :style="innerStyle()">
            <MapRender ref="render"></MapRender>
          </div>
        </div>
        <div class="right">
          <UserInfo/>
          <Action/>
        </div>
      </div>
    </div>
  </div>

  <ActionDialog @search="search"/>
  <ProfitDialog/>
  <BitmapListDialog/>
  <ProfitDialog/>
  <NextRoundSettingDialog/>
  <SettlementDialog/>
  <WalletsDialog/>
  <PurchaseDialog/>
</template>

<style>

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-div {
  height: 34px;
  background-color: #222222;
  z-index: 1;
}

.bottom-div {
  flex-grow: 1;
  background-color: black;
  overflow: hidden;
}

.box {
  display: flex;
  height: 100%;
}

.left {
  float: left;
  width: 400px;
}

.middle {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.right {
  float: right;
  width: 300px;
}

.mycard {
  margin: 10px;
}

.mytable {
  border-collapse: separate;
  border-spacing: 10px;
}

.team {
  background-color: red;
  width: 14px;
  height: 14px
}

.round {
  height: 50px;
  margin-bottom: 10px;
  z-index: 1;
  background-color: black;
}

.dialog_center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
