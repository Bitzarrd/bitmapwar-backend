<template>
  <div class="header com_flex">
    <div class="h_lf com_flex1">
      <a class="logo com_flex3" href="#.html"><img src="../../public/images/logo.png"/></a>
      <ul class="nav com_flex1">
        <li><a href="#">Explorer</a></li>
        <li><a href="#">Holders</a></li>
        <li class="cur"><a href="#">Bitmapwar</a></li>
<!--        <el-button @click="onClickStartGame">Start Game</el-button>-->

      </ul>
    </div>
    <div class="h_rt com_flex3">
      <a href="#">
        <img src="../../public/images/ico6_1.png"/></a>
      <a href="#"><img src="../../public/images/ico6_2.png"/></a>
      <a class="Wallet" href="javascript:;" @click="onClickConnUnisat">{{ connText }}</a></div>
  </div>

  <!--  <div class="top-div">-->
  <!--    <span style="margin-right: 10px;">Socket Connect: {{ socket.isConnected ? "YES" : socket.reconnectError }}</span>-->
  <!--    <el-button @click="onClickJoinGame">Join Game</el-button>-->
  <!--    <el-button @click="onClickStartGame">Start Game</el-button>-->
  <!--    <el-button @click="onClickStopGame">Stop Game</el-button>-->
  <!--    <el-button @click="nextRoundSettingDialogVisible = true">Set Next Round</el-button>-->
  <!--    <div style="float: right">-->
  <!--      <el-button @click="setWalletsDialogVisible(true)">{{-->
  <!--          wallet_address ? wallet_address : "Conn Wallet"-->
  <!--        }}-->
  <!--      </el-button>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "HeaderComponent",
  computed: {
    ...mapState(['wallet_address', 'conn']),
    connText() {
      if (this.wallet_address) {
        let address = (this.wallet_address);
        return address.substring(0, 5) + '...' + address.substring(address.length - 5);
      } else {
        return 'Connect'
      }
    }
  },
  methods: {
    ...mapActions([
      'connectMetaMask',
      'connectUnisat',
      'connectMetaMask',
      'getBitMapList',
      'login'
    ]),
    async onClickConnWallet() {
      await this.connectMetaMask();
    },
    async onClickConnUnisat() {
      await this.connectUnisat();
      await this.getBitMapList()
      await this.login(this.wallet_address);
      this.setWalletsDialogVisible(false)
    },
    onClickStartGame() {
      this.conn.sendObj({method: "StartGame"});
    },
  },
  mounted() {
    window.StartGame = this.onClickStartGame
  }
}
</script>

<style scoped>

</style>