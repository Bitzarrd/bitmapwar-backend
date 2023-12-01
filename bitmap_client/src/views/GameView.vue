<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "GameView",
  components: {MapRender},
  computed: {
    ...mapState(['socket', 'conn']),
  },
  data() {
    return {
      loading: false
    }
  },
  mounted() {

  },
  methods: {
    ...mapActions([]),
    ...mapMutations([]),
    onClickStartGame() {
      this.conn.sendObj({method: "StartGame"});
    },
    onClickStopGame() {
      this.conn.sendObj({method: "StopGame"});
    },
    onClickJoinGame() {
      this.conn.sendObj({method: "JoinGame"});
    }
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
    </div>
    <div class="bottom-div">
      <MapRender></MapRender>
    </div>
  </div>
</template>

<style>

.container {
  height: 100vh; /* 设置容器高度为整个视口的高度 */
  display: flex;
  flex-direction: column; /* 设置子元素垂直排列 */
}

.header{
  height: 34px;
  width: 100%;
  //position: absolute;
  border-bottom: white 1px;
}

.top-div {
  height: 34px;
  background-color: black;
}

.bottom-div {
  flex-grow: 1; /* 设置底部 div 自动撑满剩余空间 */
  background-color: #1d3043;
}
</style>
