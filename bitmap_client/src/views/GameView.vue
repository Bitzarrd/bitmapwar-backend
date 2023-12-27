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
import HeaderComponent from "../components/HeaderComponent.vue";
import JackPot from "@/components/JackPot.vue";
import StatusBar from "../components/StatusBar.vue";

export default {
  name: "GameView",
  components: {
    StatusBar,
    HeaderComponent,
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
      'cellSize', 'loading', 'contract', 'selected_color'
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
      render.search(middle_width, middle_height - 50, map_id, this.selected_color);
    },
    handleSearchEnter() {
      console.log("handleSearchEnter", this.searched_map);
      this.search(this.searched_map);
    },
    onClickSearchIcon() {
      console.log("onClickSearchIcon", this.searched_map);
      this.search(this.searched_map);
    }
  }
}
</script>

<template>
  <HeaderComponent/>

  <div class="warp" v-loading="loading">
    <div class="main" id="bottom-div">
      <div class="m_w com_flex">
        <div class="m_lf">
          <LandList/>
          <LastRanking/>
        </div>
        <div class="m_md">
          <StatusBar/>
          <div class="m_md_bot">
<!--            <img src="images/pic.png"/>-->
            <div style="width: 100%;display: list-item;overflow: hidden;height: 100vh">
              <div id="resizeable" :style="innerStyle()">
                <MapRender ref="render"></MapRender>
              </div>
            </div>
          </div>
        </div>

        <!--        <div class="middle" ref="middle">-->
        <!--          <div class="round">-->
        <!--            <div style="float: left;padding-top: 12px;color: #E5EAF3">-->


        <!--              <CountDown/>-->
        <!--              <NextRound/>-->
        <!--              Turn:{{ turn }}-->
        <!--              <JackPot/>-->
        <!--            </div>-->
        <!--            <div style="float: right;margin-top: 10px">-->
        <!--              <el-input size="small" placeholder="Search Bitmap" v-model="searched_map"-->
        <!--                        @keyup.enter="handleSearchEnter">-->
        <!--                <template #prepend>-->
        <!--                  <el-button>-->
        <!--                    <el-icon color="white" class="no-inherit">-->
        <!--                      <Search @click="onClickSearchIcon"/>-->
        <!--                    </el-icon>-->
        <!--                  </el-button>-->
        <!--                </template>-->
        <!--              </el-input>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--        </div>-->
        <!--        <div class="right">-->
        <!--          <UserInfo/>-->
        <!--          <Action/>-->
        <!--        </div>-->

        <div class="m_rt">
          <UserInfo/>
          <div class="search"><input class="s_inbut" type="button"/><input class="s_intxt" type="text"
                                                                           placeholder="Serch bitmap"/></div>
          <Action/>
        </div>
      </div>
    </div>
  </div>

  <ActionDialog @search="search"/>
  <ProfitDialog/>
  <BitmapListDialog @search="search"/>
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
