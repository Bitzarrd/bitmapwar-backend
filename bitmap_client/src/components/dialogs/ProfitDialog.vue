<script>
import {mapMutations, mapState} from "vuex";
import {ElMessage} from "element-plus";
import moment from "moment";

export default {
  name: "ProfitDialog",
  computed: {
    ...mapState([
      'profitDialogVisible', 'contract', 'conn', 'wallet_address', 'extracts', 'pending_extract'
    ])
  },
  data() {
    return {
      amount: 0,
      loading: false,
    }
  },
  watch: {
    async pending_extract(newVal, oldVal) {
      console.log("watch extract", newVal, oldVal);
      await this.submit(newVal.amount, newVal.signature, newVal.nonce);
      this.loading = false;
    },
    immediate: false // Prevent initial execution
  },
  methods: {
    ...mapMutations(['setProfitDialogVisible']),
    format_time(time) {
      return moment(time * 1000).format();
    },
    onClickExtractProfit() {
      if (this.loading === true) {
        return;
      }
      if (this.amount <= 0) {
        return;
      }
      this.loading = true;
      this.conn.sendObj({
        method: "ExtractProfit",
        amount: this.amount,
        address: this.wallet_address

      })
    },
    async submit(amount, signature, nonce) {
      console.log("submit", amount, signature, nonce);
      if (this.loading === true) {
        return;
      }

      try {
        const tx = await this.contract.withdrawETHWithSignature((Number)(amount), signature, nonce);
        console.log(tx);
        const txid = tx.hash;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.error(e);
        ElMessage.error('Oops, this is a error message.' + e)
      } finally {
        this.loading = false;
      }
      this.loading = false;
    },
    handleEdit(index, row) {
      console.log(index, row);
      this.submit(row.amount, row.signature, row.id);
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
        <el-table-column prop="id" label="ID" width="100"/>
        <el-table-column prop="txid" label="TXID" width="180"/>
        <el-table-column prop="amount" label="amount" width="180"/>

        <el-table-column
            prop="status"
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


        <el-table-column
            prop="create_time"
            label="Create Time"
            width="240"
        >
          <template #default="scope">
            {{ format_time(scope.row.create_time) }}
          </template>
        </el-table-column>

        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
            >
              Resubmit
            </el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setProfitDialogVisible(false)">Cancel</el-button>
        <el-button type="primary" @click="onClickExtractProfit()">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>