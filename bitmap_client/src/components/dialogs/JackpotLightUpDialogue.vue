<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "JackpotLightUpDialogue",
  computed: {
    ...mapState(['']),
  },
  data() {
    return {
      dialogVisible: true
    }
  },
  watch: {},
  methods: {
    ...mapMutations([]),
    onClickConfirm() {
      this.dialogVisible = false
    }
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Congratulations"
      width="30%"
  >
    <div>
      <div>
        <div class="w0 com_flex2"><i class="ibg ibg1" :style="{ backgroundColor: 'red' }"></i> 99999 Lands</div>
      </div>
      <div>
        <div class="w0 com_flex2">Winner:0x23123</div>
      </div>
      <div>
        <div class="w0 com_flex2">Jackpot: 99999</div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onClickConfirm">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>