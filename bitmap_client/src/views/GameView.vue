<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";
import {CirclePlus, Edit, Histogram, Rank} from "@element-plus/icons-vue";

export default {
  name: "GameView",
  components: {Edit, Histogram, Rank, CirclePlus, MapRender},
  computed: {
    ...mapState(['socket', 'conn', 'wallet_address']),
  },
  data() {
    return {
      scaleValue: 1,
      dialogVisible: false,
      purchaseDialogVisible: false,
      bitmapListDialogVisible: false,
      profitDialogVisible: false,
      value: "red",
      landList: [
        {
          team: "red",
          land: 1000,
          virus: 100,
          loss: 1000
        },
        {
          team: "yellow",
          land: 1000,
          virus: 100,
          loss: 1000
        },
        {
          team: "green",
          land: 1000,
          virus: 100,
          loss: 1000
        },
        {
          team: "purple",
          land: 1000,
          virus: 100,
          loss: 1000
        }
      ],
      lastRanking: [
        {
          id: "bc1q0......luwvg",
          lands: 1000
        },
        {
          id: "bc1q0......luwvg",
          lands: 1000
        },
        {
          id: "bc1q0......luwvg",
          lands: 1000
        },
        {
          id: "bc1q0......luwvg",
          lands: 1000
        },
        {
          id: "bc1q0......luwvg",
          lands: 1000
        },
        {
          id: "bc1q0......luwvg",
          lands: 1000
        }, {
          id: "bc1q0......luwvg",
          lands: 1000
        }, {
          id: "bc1q0......luwvg",
          lands: 1000
        },


      ],
      selected_map: "1231241231",
      maps: [
        {
          value: '#1231241231',
          label: '#1231241231',
        },
        {
          value: '#5747453345',
          label: '#5747453345',
        },
        {
          value: '#9432341241',
          label: '#9432341241',
        },
      ],
      options:
          [
            {
              value: 'red',
              label: 'Red',
            },
            {
              value: 'blue',
              label: 'Blue',
            },
            {
              value: 'green',
              label: 'Green',
            },
            {
              value: 'purple',
              label: 'Purple',
            },
          ]
    }
  }
  ,
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
        this.scaleValue = 0.1;
      }
      if (this.scaleValue > 4) {
        this.scaleValue = 4;
      }
    });

  }
  ,
  methods: {
    ...
        mapActions(['connectWallet']),
    ...
        mapMutations([]),
    onClickStartGame() {
      this.conn.sendObj({method: "StartGame"});
    }
    ,
    onClickStopGame() {
      this.conn.sendObj({method: "StopGame"});
    }
    ,
    onClickJoinGame() {
      this.conn.sendObj({method: "JoinGame"});
    }
    ,
    async onClickConnWallet() {
      await this.connectWallet();
    }
    ,
    onClickSubmit() {
      this.dialogVisible = true
    }
    ,
    onClickPurchase() {
      this.purchaseDialogVisible = true;
    }
    ,
    onClickProfits() {
      this.profitDialogVisible = true;
    }
    ,
    onClickBitmapList() {
      this.bitmapListDialogVisible = true;
    }
    ,
    innerStyle() {

      let scale = this.scaleValue;
      let result = `scale: ${scale};`;
      return result;
    }
    ,
  }
}
</script>

<template>
  <div class="container">
    <div class="top-div">
      <span style="margin-right: 10px;">Socket Connect: {{ socket.isConnected ? "YES" : socket.reconnectError }}</span>
      <el-button @click="onClickJoinGame">Join Game</el-button>
      <el-button @click="onClickStartGame">Start Game</el-button>
      <el-button @click="onClickStopGame">Stop Game</el-button>
      <div style="float: right">
        <el-button @click="onClickConnWallet">{{ wallet_address ? wallet_address : "Conn Wallet" }}</el-button>
      </div>
    </div>
    <div class="bottom-div" id="bottom-div">
      <div class="box">
        <div class="left">
          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <el-icon color="white" class="no-inherit">
                    <Histogram/>
                  </el-icon>
                  <span> Land List</span>
                </div>
              </template>
              <el-table :data="landList" style="width: 100%">
                <el-table-column prop="team" label="Team">
                  <template #default="scope">
                    <div class="team" :style="{ backgroundColor: scope.row.team }"></div>
                  </template>
                </el-table-column>
                <el-table-column prop="land" label="Land"/>
                <el-table-column prop="virus" label="Virus"/>
                <el-table-column prop="loss" label="Loss"/>
              </el-table>
            </el-card>
          </div>

          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <el-icon color="white" class="no-inherit">
                    <Rank/>
                  </el-icon>
                  <span> Last Ranking</span>
                </div>
              </template>
              <el-table :data="lastRanking" style="width: 100%">
                <el-table-column type="index" width="50" />
                <el-table-column prop="id" label="ID"/>
                <el-table-column prop="lands" label="Lands"/>
              </el-table>
            </el-card>
          </div>

        </div>
        <div class="middle">
          <div class="round">
            <div style="float: left;padding-top: 12px;color: #E5EAF3">
              Rounds:1000
              NextRounds:03:00
            </div>
            <div style="float: right;margin-top: 10px">
              <el-input size="small" placeholder="Search Bitmap">
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
            <MapRender></MapRender>
          </div>
        </div>
        <div class="right">
          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <el-icon color="white" class="no-inherit">
                    <User/>
                  </el-icon>
                  <span> User Info</span>
                </div>
              </template>


              <el-form label-width="70px" v-if="wallet_address">
                <el-form-item label="ID:">
                  <el-input value="bc1q0......luwvg" disabled/>
                </el-form-item>
                <el-form-item label="Profit:">
                  <el-input value="10 BTC" disabled
                            style="float: left;display: inline;width: 100px;margin-right: 10px"/>
                  <el-button @click="onClickProfits" style="float: right;display: inline">
                    <el-icon color="white" class="no-inherit">
                      <Coin/>
                    </el-icon>
                  </el-button>
                </el-form-item>
                <el-form-item label="Bitmaps:">
                  <el-input value="740" disabled style="float: left;display: inline;width: 100px;margin-right: 10px"/>
                  <el-button @click="onClickBitmapList" style="float: right;display: inline">
                    <el-icon color="white" class="no-inherit">
                      <View/>
                    </el-icon>
                  </el-button>
                </el-form-item>
                <el-form-item label="Virus:">
                  <el-input value="100" disabled style="float: left;display: inline;width: 100px;margin-right: 10px"/>
                  <el-button @click="onClickPurchase" style="float: right;display: inline">
                    <el-icon color="white" class="no-inherit">
                      <CirclePlus/>
                    </el-icon>
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>


          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <el-icon color="white" class="no-inherit">
                    <Edit/>
                  </el-icon>
                  <span> Action</span>
                </div>
              </template>
              <el-form label-width="80px" v-if="wallet_address">
                <el-form-item label="Function:">
                  <el-select v-model="value" class="m-2" placeholder="Select">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                        <span :style="{ color: item.value }">
                          {{ item.label }}
                        </span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Bitmap:">
                  <el-input value="#12314212" disabled/>
                </el-form-item>
                <el-form-item label="Owner:">
                  <el-input value="fhswf....asdad" disabled/>
                </el-form-item>
                <el-form-item label="Virus:">
                  <el-input value="0"/>
                </el-form-item>
              </el-form>
              <template #footer>
                <div style="display: flex; justify-content: right;" v-if="wallet_address">
                <el-button @click="onClickSubmit">Submit</el-button>
                </div>
              </template>

            </el-card>
          </div>

        </div>
      </div>
    </div>
  </div>

  <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="30%"
      :before-close="handleClose"
  >
    <span>After selecting a faction, this match cannot be modified. Are you sure?</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
      v-model="profitDialogVisible"
      title="Extract Profit"
      width="30%"
  >
    <div class="">
      <el-form label-width="100px">
        <el-form-item label="Profit">
          <el-input value="10 BTC" disabled/>
        </el-form-item>
        <el-form-item label="EnterAmount">
          <el-input value="0" placeholder="please enter"/>
        </el-form-item>
        <el-form-item label="Fee">
          <el-input value="0.004 BTC" disabled/>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="profitDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="profitDialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
      v-model="bitmapListDialogVisible"
      title="Bitmap List"
      width="30%"
  >
    <el-form label-width="100px">
      <el-form-item label="Maps">
        <el-select v-model="selected_map" filterable placeholder="Select">
          <el-option
              v-for="item in maps"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="bitmapListDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="bitmapListDialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
      v-model="purchaseDialogVisible"
      title="Purchase"
      width="30%"
  >
    <div class="dialog_center">
      <div>
        <el-input-number placeholder="Virus"></el-input-number>
      </div>
      <div style="margin:20px;font-size: 20px">1BTC = 0.004</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="purchaseDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="purchaseDialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>


</template>

<style>

.container {
  height: 100vh; /* 设置容器高度为整个视口的高度 */
  display: flex;
  flex-direction: column; /* 设置子元素垂直排列 */
}

.top-div {
  height: 34px;
  background-color: #222222;
  z-index: 1;
}

.bottom-div {
  flex-grow: 1; /* 设置底部 div 自动撑满剩余空间 */
  background-color: black;
  overflow: hidden; /* 设置溢出内容隐藏 */
}

.box {
  display: flex;
  height: 100%;
}

.left {
  float: left;
  width: 400px;
//background-color: #1d3043;
}

.middle {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
//background-color: green; overflow: hidden; /* 设置溢出内容隐藏 */
}

.right {
  float: right;
  width: 300px;
//background-color: #2a598a;
}

.mycard {
  margin: 10px;
}

.mytable {
  border-collapse: separate;
  border-spacing: 10px; /* 设置行间距的像素值 */
}

.team {
  background-color: red;
  width: 14px;
  height: 14px
}

.round {
  height: 50px;
  margin-bottom: 10px;
  z-index: 9999;
  background-color: black;
}

.dialog_center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
