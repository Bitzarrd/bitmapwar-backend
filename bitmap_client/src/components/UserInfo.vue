<script>
import {mapMutations, mapState} from "vuex";
import {shortend} from "@/utils";
import {formatEther} from "ethers";
import {CirclePlus, Coin, View} from "@element-plus/icons-vue";

export default {
  name: "UserInfo",
  components: {Coin, View, CirclePlus},
  computed: {
    ...mapState(['wallet_address', 'user', 'selected_map'])
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
  }
}
</script>

<template>
  <div class="mycard">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <el-icon color="white" class="no-inherit">
            <User/>
          </el-icon>
          <span> User Info</span>
        </div>
      </template>


      <el-form label-width="70px" v-if="wallet_address">
        <el-form-item label="ID:">
          <el-tooltip
              class="box-item"
              effect="dark"
              content="Top Center prompts info"
              placement="top"
          >
            <el-input :value="shortend(wallet_address)" disabled/>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="Profit(BTC):">
          <el-input :value="formatEther(user.profit)" disabled
                    style="float: left;display: inline;width: 100px;margin-right: 10px"/>
          <el-button @click="onClickProfits" style="float: right;display: inline">
            <el-icon color="white" class="no-inherit">
              <Coin/>
            </el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="Bitmaps:">
          <el-input :value="selected_map" disabled
                    style="float: left;display: inline;width: 100px;margin-right: 10px"/>
          <el-button @click="onClickBitmapList" style="float: right;display: inline">
            <el-icon color="white" class="no-inherit">
              <View/>
            </el-icon>
          </el-button>
        </el-form-item>
        <el-form-item label="Bit:">
          <el-input :value="user.virus" disabled
                    style="float: left;display: inline;width: 100px;margin-right: 10px"/>
          <el-button @click="onClickPurchase" style="float: right;display: inline">
            <el-icon color="white" class="no-inherit">
              <CirclePlus/>
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>

</style>