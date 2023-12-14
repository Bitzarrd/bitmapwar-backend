<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "NextRoundSettingDialog",
  computed:{
    ...mapState([
      'nextRoundSettingDialogVisible'
    ]),
    dialogVisible: {
      get() {
        return this.nextRoundSettingDialogVisible
      },
      set(val) {
        this.setNextRoundSettingDialogVisible(val)
      }
    },
  },
  data() {
    return {
    }
  },
  methods:{
    ...mapMutations(['setNextRoundSettingDialogVisible']),
    onClickSubmitNextRoundSetting() {
      this.nextRoundSettingDialogVisible = false;
      this.conn.sendObj({method: "SetNextRound", timestamp: this.nextRoundSetting});
      this.nextRoundSettingDialogVisible = false
    },
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Set Next Round Time"
      width="30%"
  >
    <div class="dialog_center">
      <div>
        <el-input placeholder="timestamp" v-model="nextRoundSetting"></el-input>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="nextRoundSettingDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onClickSubmitNextRoundSetting();">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>