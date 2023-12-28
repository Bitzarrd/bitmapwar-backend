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
        <div class="w0 com_flex2">
          Jackpot: 99999

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