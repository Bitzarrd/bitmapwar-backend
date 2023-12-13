<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "WalletsDialog",
  computed:{
    ...mapState([
      'walletsDialogVisible'
    ])
  },
  data() {
    return {
    }
  },
  methods:{
    ...mapActions([
      'connectUnisat',
      'connectMetaMask',
      'getBitMapList',
      'login'
    ]),
    ...mapMutations(['']),
    async onClickConnUnisat() {
      await this.connectUnisat();
      await this.getBitMapList()
      await this.login(this.wallet_address);
      this.walletsDialogVisible = false;
    },
    async onClickConnMetamask() {
      await this.connectMetaMask();
      await this.getBitMapList()
      await this.login(this.wallet_address);
      this.walletsDialogVisible = false;
    },
  }
}
</script>

<template>
  <el-dialog
      v-model="walletsDialogVisible"
      title="Select Your Wallet"
      width="30%"
  >
    <el-button @click="onClickConnUnisat">UniSet</el-button>
    <el-button @click="onClickConnMetamask">MetaMask</el-button>
  </el-dialog>
</template>

<style scoped>

</style>