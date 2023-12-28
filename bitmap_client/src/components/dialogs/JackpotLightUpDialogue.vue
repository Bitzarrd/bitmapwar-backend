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
              url="https://news.vuejs.org/issues/180"
              title="Say hi to Vite! A brand new, extremely fast development setup for Vue."
              description="This week, I’d like to introduce you to 'Vite', which means 'Fast'. It’s a brand new development setup created by Evan You."
              quote="The hot reload is so fast it\'s near instant. - Evan You"
              hashtags="vuejs,vite"
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