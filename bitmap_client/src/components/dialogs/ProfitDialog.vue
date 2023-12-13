<script>
import {mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "ProfitDialog",
  computed: {
    ...mapState([
      'profitDialogVisible', 'contract'
    ])
  },
  data() {
    return {}
  },
  methods: {
    async onClickExtractProfit() {
      try {
        const amount = 100;
        const signature = "0xa9631881a814aec5b1faaf2a9b70be0212195704a76b99e20dc00796722e3ef77007b09c49e45f0d5afd5056e5e11d34069d8b7251b967e744ee9327af6d04f21c";
        const nonce = 1;
        const tx = await this.contract.withdrawETHWithSignature(amount, signature, nonce);
        console.log(tx);
        const txid = tx.hash;
      } catch (e) {
        console.error(e);
        ElMessage.error('Oops, this is a error message.' + e)
      }
    }
  }
}
</script>

<template>
  <el-dialog
      v-model="profitDialogVisible"
      title="Extract Profit"
      width="30%"
  >
    <div class="">
      <el-form label-width="100px">
        <el-form-item label="Profit">
          <el-input value="10.123456 BTC" disabled/>
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
        <el-button type="primary" @click="onClickExtractProfit()">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>