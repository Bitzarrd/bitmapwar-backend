<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {ElMessage} from "element-plus";
import {shortend, sleep} from "@/utils";
import {formatEther} from "ethers";
import moment from "moment/moment";
import {Search} from "@element-plus/icons-vue";

export default {
  name: "PurchaseDialog",
  components: {Search},
  computed: {
    ...mapState([
      'purchaseDialogVisible', 'contract', 'socket', 'conn', 'purchase'
    ]),
    dialogVisible: {
      get() {
        return this.purchaseDialogVisible
      },
      set(val) {
        this.setPurchaseDialogVisible(val)
      }
    },
  },
  data() {
    return {
      purchaseLoading: false,
      amount: 0,
      searchTxDialogVisible: false,
      searchTxHash: null
    }
  },
  methods: {
    formatEther,
    shortend,
    ...mapActions([]),
    ...mapMutations(['setPurchaseDialogVisible',]),
    format_time(time) {
      return moment(time * 1000).format();
    },
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
        const tx = await this.contract.BuyToken({value: this.amount});
        console.log(tx);
        const txid = tx.hash;
        const message = {
          method: "Purchase",
          txid: txid,
        };
        await sleep(3000);
        this.conn.sendObj(message);
        this.setPurchaseDialogVisible(false);
      } catch (e) {
        console.error(e);
        ElMessage.error('Oops, this is a error message.' + e)
      } finally {
        this.purchaseLoading = false;
      }
    },
    onClickSearchTx() {
      this.searchTxDialogVisible = true;
    },
    async onClickSubmitSearchTx() {
      const message = {
        method: "Purchase",
        txid: this.searchTxHash,
      };
      this.conn.sendObj(message);
      this.searchTxDialogVisible = false;
    }
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Purchase"
      width="60%"
  >
    <div class="dialog_center" v-loading="purchaseLoading">

      <div style="margin-bottom: 10px">
        <el-alert
            title="Please do not close the browser or refresh the page during the recharge process. If you encounter any issues, please click the 'Search' button in the order and manually enter the TX hash to retry the operation."
            type="warning"/>
      </div>
      <div>
        <el-input-number placeholder="Bit" v-model="amount"></el-input-number>
      </div>
      <div style="margin:20px;font-size: 20px">1BTC = 0.004</div>

      <div style="border: #333333 1px solid;width: 100%">
        <el-table :data="purchase" :scrollbar-always-on="true" :max-height="300" style="width: 100%">


          <el-table-column prop="id" label="ID" width="100"/>
          <el-table-column prop="txid" label="TXID">
            <template #default="scope">
              <el-popover effect="light" trigger="hover" placement="top" width="auto">
                <template #default>
                  <div> {{ (scope.row.txid) }}</div>
                </template>
                <template #reference>
                  {{ shortend(scope.row.txid) }}
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="Fee" label="Fee">
            <template #default="scope">
              <el-popover effect="light" trigger="hover" placement="top" width="auto">
                <template #default>
                  <div> {{ (scope.row.fee) }}</div>
                </template>
                <template #reference>
                  {{ formatEther(scope.row.fee) }} BTC
                </template>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column prop="virus" label="BIT" width="140"/>

          <el-table-column
              prop="create_time"
              label="Create Time"
              width="240"
          >
            <template #default="scope">
              {{ format_time(scope.row.create_time) }}
            </template>
          </el-table-column>

          <el-table-column
              prop="status"
              label="Status"
              width="100"
          >
            <template #default="scope">
              <el-tag
                  type="success"
                  disable-transitions
              >
                Success
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column align="right">
            <template #header>

              <el-button @click="onClickSearchTx">
                <el-icon color="white" class="no-inherit">
                  <Search/>
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
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

  <el-dialog
      v-model="searchTxDialogVisible"
      title="Search Tx"
      width="60%"
  >
    <el-input placeholder="Please enter the blockchain order hash starting with '0x'."
              v-model="searchTxHash"></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="searchTxDialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="onClickSubmitSearchTx">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

</template>

<style scoped>

</style>