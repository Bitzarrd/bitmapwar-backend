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
      this.conn.sendObj({method: "LoadMap2"});
      this.setBitmapListDialogVisible(true);
    },
    onClickRentBitmap() {
      this.conn.sendObj({method: "RentBitmap", day: 7, type: "profit", map_id: 1234});
    },
    JoinGameBatch() {
      this.conn.sendObj({method: "JoinGameBatch", virus: 1, color: "red", map_id: 1234});

    },
    BuyGoodsForRentMap() {
      this.conn.sendObj({
        "map_id": 33333,
        "txid": "0x473f026eda02b6d3a4bb22edfc033a45afad9f5d0cb11bdee76e21ea54631958",
        "method": "BuyGoodsForRentMap"
      });
    },

    onClickShare() {
      console.log("share", this.wallet_address);
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
    <div class="titc com_flex3"><img src="../../public/images/ico3.png"/><em>User Info</em></div>
    <div class="infor_w" v-if="wallet_address">
      <div class="infor_id">
        <p>ID: {{ shortend(wallet_address) }}</p>
        <em>{{ (wallet_address) }}</em>
      </div>
      <div class="infor_c infor_1">
        <a class="com_ico com_flex2" href="javascript:;" @click="onClickProfits"><img
            src="../../public/images/ico8_1.png"/></a>
        <em>Profit(BTC)</em>
        <span>{{ formatEther(user.profit) }}</span>
      </div>
      <div class="infor_c com_flex"><em>Bitmaps</em><span>{{ selected_map }}</span>
        <a class="com_ico com_flex2" href="javascript:;" @click="onClickBitmapList">
          <img src="../../public/images/ico8_2.png"/>
        </a>
      </div>
      <div class="infor_c com_flex">
        <em>Soldier</em><span>{{ user.virus }}</span>
        <a class="com_ico com_flex2" href="javascipt:;" @click="onClickPurchase">
          <img src="../../public/images/ico8_3.png"/>
        </a>
      </div>
      <div class="infor_4" style="font-size: 12px">
        <em>Sharing Reward:</em>
        <span>500 Soldier</span>
        <ShareNetwork
            network="Twitter"
            url="https://???"
            title="I just received a free soldier🤺 in #BitmapWar and am ready to engage in battles with other players on the #Bitmap. 🚀"
            description="I just received a free soldier🤺 in #BitmapWar and am ready to engage in battles with other players on the #Bitmap. 🚀"
            hashtags="Bitmap,Bitcoin"
            class="com_ico com_flex2"
            @click="onClickShare"
        >
          <!--          <a class="com_ico com_flex2" href="#">-->
          <img src="../../public/images/ico8_4.png"/>
          <!--          </a>-->
        </ShareNetwork>
        <button @click="onClickRentBitmap">onClickRentBitmap</button>
        <button @click="JoinGameBatch">JoinGameBatch</button>
        <button @click="BuyGoodsForRentMap">BuyGoodsForRentMap</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>