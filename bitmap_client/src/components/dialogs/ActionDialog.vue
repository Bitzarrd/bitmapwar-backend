<script>
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "ActionDialog",
  computed: {
    ...mapState(['wallet_address', 'actionDialogVisible', 'conn', 'selected_map', 'virus']),
    dialogVisible: {
      get() {
        return this.dialogVisible
      },
      set(val) {
        this.setActionDialogVisible(val)
      }
    },
    data() {
      return {
        value: "red",
      }
    },
    methods: {
      ...mapActions([]),
      ...mapMutations(['setActionDialogVisible']),
      onClickConfirm() {
        const message = {
          method: "JoinGame2",
          color: this.value,
          map_id: this.selected_map,
          virus: this.virus,
          owner: this.wallet_address,
        };
        this.conn.sendObj(message);
        this.setDialogVisible(false);
        this.$emit('search', message.map_id);
      },
    }
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
        <el-button @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="onClickConfirm">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>