<script>
import {mapState} from "vuex";
import {shortend} from "@/utils";
import {formatEther} from "ethers";

export default {
  name: "UserInfo",
  computed:{
    ...mapState(['wallet_address', 'user'])
  },
  methods:{
    formatEther,
    shortend,
    onClickPurchase() {
      this.purchaseDialogVisible = true;
    },
    onClickProfits() {
      this.profitDialogVisible = true;
    },
    onClickBitmapList() {
      this.bitmapListDialogVisible = true;
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
          <el-input :value="shortend(wallet_address)" disabled/>
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