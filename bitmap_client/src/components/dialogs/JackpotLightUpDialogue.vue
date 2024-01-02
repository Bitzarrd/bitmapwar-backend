<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "JackpotLightUpDialogue",
  computed: {
    ...mapState(['jackpotLightUp']),
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    jackpotLightUp(newVal, oldVal) {
      this.dialogVisible = true
    }
  },
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
        <div class="w0 com_flex2"><i class="ibg ibg1" :style="{ backgroundColor: jackpotLightUp.team }"></i> {{jackpotLightUp.land}} Lands</div>
      </div>
      <div>
        <div class="w0 com_flex2">Winner:{{jackpotLightUp.user.address}}</div>
      </div>
      <div>
        <div class="w0 com_flex2">
          Jackpot: {{ jackpotLightUp.jackpot }}

          <ShareNetwork
              network="Twitter"
              url="https://???"
              :title="'In the @BitmapWar,' +jackpotLightUp.user.address+' won ' +jackpotLightUp.jackpot +' BTC in the Jackpot as his reward. Feeling lucky? Join in and try your luck too!'"
              :description="'In the @BitmapWar,' +jackpotLightUp.user.address+' won ' +jackpotLightUp.jackpot +' BTC in the Jackpot as his reward. Feeling lucky? Join in and try your luck too!'"
              hashtags="BitMap,BitCoin"
              class=""
          >
            <!--          <a class="com_ico com_flex2" href="#">-->
            <img src="../../../public/images/ico8_4.png"/>
            <!--          </a>-->
          </ShareNetwork>
        </div>

      </div>
    </div>

    <!--    <template #footer>-->
    <!--      <span class="dialog-footer">-->
    <!--        <el-button type="primary" @click="onClickConfirm">-->
    <!--          Confirm-->
    <!--        </el-button>-->
    <!--      </span>-->
    <!--    </template>-->
  </el-dialog>
</template>

<style scoped>

</style>