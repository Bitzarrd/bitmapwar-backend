<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "PurchaseDialog",
  computed: {
    ...mapState([
      'purchaseDialogVisible', 'contract', 'socket'
    ])
  },
  data() {
    return {
      purchaseLoading: false,
    }
  },
  methods: {
    ...mapActions([]),
    ...mapMutations(['setPurchaseDialogVisible',]),
    async onClickBuyVirus() {
      if (this.purchaseLoading) {
        return;
      }
      if (!this.socket.isConnected) {
        ElMessage.error("Please connect to the server first.");
        return;
      }
      try {
        this.purchaseLoading = true;
        const tx = await this.contract.BuyToken({value: 1000});
        console.log(tx);
        const txid = tx.hash;
        const message = {
          method: "Purchase",
          txid: txid,
        };
        this.conn.sendObj(message);
        this.setPurchaseDialogVisible(false);
      } catch (e) {
        console.error(e);
        ElMessage.error('Oops, this is a error message.' + e)
      } finally {
        this.purchaseLoading = false;
      }
    },
  }
}
</script>

<template>
  <el-dialog
      v-model="purchaseDialogVisible"
      title="Purchase"
      width="30%"
  >
    <div class="dialog_center" v-loading="purchaseLoading">
      <div>
        <el-input-number placeholder="Bit"></el-input-number>
      </div>
      <div style="margin:20px;font-size: 20px">1BTC = 0.004</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setPurchaseDialogVisible(false)">Cancel</el-button>
        <el-button type="primary" @click="onClickBuyVirus">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>