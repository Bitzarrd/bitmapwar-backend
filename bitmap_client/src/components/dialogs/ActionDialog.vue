<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "ActionDialog",
  data() {

  },
  methods: {
    ...mapMutations(['setActionDialogVisible']),
    onClickConfirm() {
      if (this.virus <= 0) {
        ElMessage.error("Bit must be greater than 0")
        return;
      }
      if (this.virus > this.user.virus) {
        ElMessage.error("Insufficient Bit");
        return;
      }
      if (!this.selected_map) {
        ElMessage.error("Please select a map");
        return;
      }

      console.log(this.value);

      const message = {
        method: "JoinGame2",
        color: this.selected_color,
        map_id: this.selected_map,
        virus: this.virus,
        owner: this.wallet_address,
      };
      this.conn.sendObj(message);
      this.dialogVisible = false;
      this.$emit('search', message.map_id);
    },
  },
  computed: {
    ...mapState(['wallet_address', 'actionDialogVisible', 'conn', 'selected_map', 'virus', 'user','selected_color']),
    dialogVisible: {
      get() {
        return this.actionDialogVisible;
      },
      set(val) {
        this.setActionDialogVisible(val);
      }
    },
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="30%"
  >
    <span>After selecting a faction, this match cannot be modified. Are you sure?</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setActionDialogVisible(false)">Cancel</el-button>
        <el-button type="primary" @click="onClickConfirm">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>