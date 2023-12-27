<script>
import {mapMutations, mapState} from "vuex";
import {shortend} from "@/utils";
import {formatEther} from "ethers";
import {CirclePlus, Coin, Share, View} from "@element-plus/icons-vue";

export default {
  name: "UserInfo",
  components: {Share, Coin, View, CirclePlus},
  computed: {
    ...mapState(['wallet_address', 'user', 'selected_map', 'conn'])
  },
  data() {
    return {}
  },
  watch: {},
  methods: {
    formatEther,
    shortend,
    ...mapMutations(['setPurchaseDialogVisible', 'setProfitDialogVisible', 'setBitmapListDialogVisible']),
    onClickPurchase() {
      this.setPurchaseDialogVisible(true);
    },
    onClickProfits() {
      this.setProfitDialogVisible(true);
    },
    onClickBitmapList() {
      this.setBitmapListDialogVisible(true);
    },
    onClickShare() {
      console.log("share");
      this.conn.sendObj({
        method: "Share",
        owner: this.wallet_address,
      })
    }
  }
}
</script>

<template>
<!--  <div class="mycard">-->
<!--    <el-card class="box-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <el-icon color="white" class="no-inherit">-->
<!--            <User/>-->
<!--          </el-icon>-->
<!--          <span> User Info</span>-->
<!--        </div>-->
<!--      </template>-->


<!--      <el-form label-width="70px" v-if="wallet_address">-->
<!--        <el-form-item label="ID:">-->
<!--          <el-tooltip-->
<!--              class="box-item"-->
<!--              effect="dark"-->
<!--              :content="wallet_address"-->
<!--              placement="top"-->
<!--          >-->
<!--            <el-input :value="shortend(wallet_address)" disabled/>-->
<!--          </el-tooltip>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Profit(BTC):">-->
<!--          <el-tooltip-->
<!--              class="box-item"-->
<!--              effect="dark"-->
<!--              :content="formatEther(user.profit)"-->
<!--              placement="top"-->
<!--          >-->
<!--            <el-input :value="formatEther(user.profit)" disabled-->
<!--                      style="float: left;display: inline;width: 110px;margin-right: 10px"/>-->
<!--          </el-tooltip>-->
<!--          <el-button @click="onClickProfits" style="float: right;display: inline" disabled>-->
<!--            <el-icon color="white" class="no-inherit">-->
<!--              <Coin/>-->
<!--            </el-icon>-->
<!--          </el-button>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Bitmaps:">-->
<!--          <el-input :value="selected_map" disabled-->
<!--                    style="float: left;display: inline;width: 110px;margin-right: 10px"/>-->
<!--          <el-button @click="onClickBitmapList" style="float: right;display: inline">-->
<!--            <el-icon color="white" class="no-inherit">-->
<!--              <View/>-->
<!--            </el-icon>-->
<!--          </el-button>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Soldier:">-->
<!--          <el-input :value="user.virus" disabled-->
<!--                    style="float: left;display: inline;width: 110px;margin-right: 10px"/>-->
<!--          <el-button @click="onClickPurchase" style="float: right;display: inline" disabled>-->
<!--            <el-icon color="white" class="no-inherit">-->
<!--              <CirclePlus/>-->
<!--            </el-icon>-->
<!--          </el-button>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="Free">-->
<!--          <el-input disabled placeholder="500 Soldier"-->
<!--                    style="float: left;display: inline;width: 110px;margin-right: 10px"/>-->

<!--          <ShareNetwork-->
<!--              network="Twitter"-->
<!--              url="https://news.vuejs.org/issues/180"-->
<!--              title="Say hi to Vite! A brand new, extremely fast development setup for Vue."-->
<!--              description="This week, I’d like to introduce you to 'Vite', which means 'Fast'. It’s a brand new development setup created by Evan You."-->
<!--              quote="The hot reload is so fast it\'s near instant. - Evan You"-->
<!--              hashtags="vuejs,vite"-->
<!--          >-->
<!--            <el-button @click="onClickShare" style="float: right;display: inline">-->
<!--              <el-icon color="white" class="no-inherit">-->
<!--                <Share/>-->
<!--              </el-icon>-->
<!--            </el-button>-->
<!--          </ShareNetwork>-->


<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->
<!--  </div>-->

  <div class="combg">
    <div class="titc com_flex3"><img src="images/ico3.png"/><em>User Infor</em></div>
    <div class="infor_w">
      <div class="infor_id">
        <p>ID: 0x86d3886d56721dd43a94d76f6ac30caa54af8620</p>
        <em>0x86d3886d56721dd43a94d76f6ac30caa54af8620</em>
      </div>
      <div class="infor_c infor_1">
        <a class="com_ico com_flex2" href="#"><img src="images/ico8_1.png"/></a>
        <em>Profit(BTC)</em>
        <span>0.000000000</span>
      </div>
      <div class="infor_c com_flex"><em>Bitmaps</em><span>818888</span><a class="com_ico com_flex2"
                                                                          href="#"><img
          src="images/ico8_2.png"/></a></div>
      <div class="infor_c com_flex"><em>Soldier</em><span>599</span><a class="com_ico com_flex2" href="#"><img
          src="images/ico8_3.png"/></a></div>
      <div class="infor_4"><em>Daily Sharing Reward:</em><span>500 Soldier</span><a class="com_ico com_flex2"
                                                                                    href="#"><img
          src="images/ico8_4.png"/></a></div>
    </div>
  </div>
</template>

<style scoped>

</style>