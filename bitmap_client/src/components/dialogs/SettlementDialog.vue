<script>
import {mapState} from "vuex";
import {formatEther} from "ethers";

export default {
  name: "SettlementDialog",
  computed: {
    ...mapState([
      'settlementDialogVisible', 'settlementLandList', 'settlement'
    ]),
    dialogVisible: {
      get() {
        return this.settlementDialogVisible
      },
      set(val) {
        this.setSettlementDialogVisible(val)
      }
    },
  },
  watch: {
    // settlement(newVal, oldVal) {
    //   this.dialogVisible = true;
    // }
  },
  data() {
    return {}
  },
  methods: {
    ...mapState(['setSettlementDialogVisible']),
    formatEther,
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Settlement"
      width="30%"
  >
    <el-table :data="settlementLandList" style="width: 100%">
      <el-table-column type="index" width="80" label="Ranking"/>
      <el-table-column prop="team" label="Team">
        <template #default="scope">
          <div class="team" :style="{ backgroundColor: scope.row.team }"></div>
        </template>
      </el-table-column>
      <el-table-column prop="land" label="Land"/>
      <el-table-column prop="virus" label="Bit"/>
      <el-table-column prop="loss" label="Loss"/>
    </el-table>

    <div style="margin-top: 20px" v-if="settlement">
      <div>Your Land: {{ settlement.statistics.land }}</div>
      <div>Your Bit: {{ settlement.statistics.virus }}</div>
      <div>Your Loss {{ settlement.statistics.loss }}</div>
      <div>Your Earnings(BTC): {{ formatEther(settlement.earning) }}</div>

    </div>
  </el-dialog>
</template>

<style scoped>

</style>