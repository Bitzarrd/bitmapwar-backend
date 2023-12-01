<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "GameView",
  components: {MapRender},
  computed: {
    ...mapState(['socket', 'conn', 'wallet_address']),
  },
  data() {
    return {
      scaleValue: 1,
      dialogVisible: false,
      value: "Option1",
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
      options: [
        {
          value: 'Option1',
          label: 'Option1',
        },
        {
          value: 'Option2',
          label: 'Option2',
        },
        {
          value: 'Option3',
          label: 'Option3',
        },
        {
          value: 'Option4',
          label: 'Option4',
        },
        {
          value: 'Option5',
          label: 'Option5',
        },
      ]
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
        this.scaleValue = 0.1;
      }
      if (this.scaleValue > 4) {
        this.scaleValue = 4;
      }
    });

  },
  methods: {
    ...mapActions(['connectWallet']),
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
    async onClickConnWallet() {
      await this.connectWallet();
    },
    onClickSubmit() {
      this.dialogVisible = true
    },
    innerStyle() {

      let scale = this.scaleValue;
      let result = `scale: ${scale};`;
      return result;
    },
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
                  <span>Land List</span>
                </div>
                <el-table :data="landList" style="width: 100%">
                  <el-table-column prop="team" label="Team"/>
                  <el-table-column prop="land" label="Land"/>
                  <el-table-column prop="virus" label="Virus"/>
                  <el-table-column prop="loss" label="Loss"/>
                </el-table>
              </template>
            </el-card>
          </div>

          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>Last Ranking</span>
                </div>
                <el-table :data="lastRanking" style="width: 100%">
                  <el-table-column prop="id" label="ID"/>
                  <el-table-column prop="lands" label="Lands"/>
                </el-table>
              </template>
            </el-card>
          </div>

        </div>
        <div class="middle">
          <div id="resizeable" :style="innerStyle()">
            <MapRender></MapRender>
          </div>
        </div>
        <div class="right">
          <div class="mycard">
            <el-card class="box-card">
              <template #header>
                <div class="card-header">
                  <span>UserInfo</span>
                </div>
              </template>
              <div>ID: bc1q0......luwvg</div>
              <div>Profit:10BNB</div>
              <div>Bitmaps:700</div>
              <div>Virus:100
                <el-button>
                  <el-icon color="#409EFC" class="no-inherit">
                    <Share />
                  </el-icon>
              </el-button>
              </div>
              <el-select v-model="value" class="m-2" placeholder="Select">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
              <el-button @click="onClickSubmit">Submit</el-button>
            </el-card>
          </div>

          <div class="mycard">
            <el-card class="box-card">
              asdasdasdsdasd
            </el-card>
          </div>
          <div class="mycard">
            <el-card class="box-card">
              asdasdasdsdasd
            </el-card>
          </div>
          <div class="mycard">
            <el-card class="box-card">
              asdasdasdsdasd
            </el-card>
          </div>
          <div class="mycard">
            <el-card class="box-card">
              asdasdasdsdasd
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
    <span>This is a message</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
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
</style>
