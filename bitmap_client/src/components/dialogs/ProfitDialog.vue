<script>
import {mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "ProfitDialog",
  computed: {
    ...mapState([
      'profitDialogVisible', 'contract', 'conn', 'wallet_address', 'extracts', 'extract'
    ])
  },
  data() {
    return {
      amount: 0,
      loading: false
    }
  },
  watch: {
    extract(newVal, oldVal) {
      this.submit(newVal.amount, newVal.signature, newVal.nonce);
    }
  },
  methods: {
    onClickExtractProfit() {
      this.loading = true;
      this.conn.sendObj({
        method: "ExtractProfit",
        amount: this.amount,
        address: this.wallet_address

      })
    },
    async submit(amount, signature, nonce) {
      try {
        const tx = await this.contract.withdrawETHWithSignature((Number)(amount), signature, nonce);
        console.log(tx);
        const txid = tx.hash;
      } catch (e) {
        console.error(e);
        ElMessage.error('Oops, this is a error message.' + e)
      } finally {
        this.loading = false;
      }
    },
    handleEdit(index, row) {
      console.log(index, row);
    }
  }
}
</script>

<template>
  <el-dialog
      v-model="profitDialogVisible"
      title="Extract Profit"
      width="80%"
  >
    <div class="" v-loading="loading">
      <el-form label-width="100px">
        <el-form-item label="Profit">
          <el-input value="10.123456 BTC" disabled/>
        </el-form-item>
        <el-form-item label="EnterAmount">
          <el-input value="0" placeholder="please enter" v-model="amount"/>
        </el-form-item>
        <el-form-item label="Fee">
          <el-input value="0.004 BTC" disabled/>
        </el-form-item>
      </el-form>
      <el-table :data="extracts" :scrollbar-always-on="true" :max-height="300" style="width: 100%">
        <el-table-column prop="txid" label="TXID" width="180"/>
        <el-table-column prop="amount" label="amount" width="180"/>

        <el-table-column
            prop="tag"
            label="Status"
            width="100"
        >
          <template #default="scope">
            <el-tag
                :type="scope.row.tag === '1' ? '' : 'success'"
                disable-transitions
            >
              Pending
            </el-tag>
          </template>
        </el-table-column>


        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
            >Edit
            </el-button
            >
          </template>
        </el-table-column>
      </el-table>
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