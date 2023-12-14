<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "WalletsDialog",
  computed: {
    ...mapState([
      'walletsDialogVisible', 'wallet_address'
    ]),
    dialogVisible: {
      get() {
        return this.walletsDialogVisible
      },
      set(val) {
        this.setWalletsDialogVisible(val)
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    ...mapActions([
      'connectUnisat',
      'connectMetaMask',
      'getBitMapList',
      'login'
    ]),
    ...mapMutations(['setWalletsDialogVisible']),
    async onClickConnUnisat() {
      await this.connectUnisat();
      await this.getBitMapList()
      await this.login(this.wallet_address);
      this.setWalletsDialogVisible(false)
    },
    async onClickConnMetamask() {
      await this.connectMetaMask();
      await this.getBitMapList()
      await this.login(this.wallet_address);
      this.setWalletsDialogVisible(false)
    },
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Select Your Wallet"
      width="30%"
  >
    <el-button @click="onClickConnUnisat">UniSet</el-button>
    <el-button @click="onClickConnMetamask">MetaMask</el-button>
  </el-dialog>
</template>

<style scoped>

</style>