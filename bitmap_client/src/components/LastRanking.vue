<script>
import {mapState} from "vuex";
import {shortend} from "@/utils";
import {Rank} from "@element-plus/icons-vue";
import {formatEther} from "ethers";

export default {
  name: "LastRanking",
  components: {Rank},
  data() {
    return {
      tag: 'profit',
    };
  },
  methods: {
    shortend,
    formatEther,
    onClickLands() {
      this.tag = "lands";
    },
    onClickProfit() {
      this.tag = "profit";
    },
    onClickChange() {
      if (this.tag === 'lands') {
        this.tag = 'profit';
      } else {
        this.tag = 'lands';
      }
    }
  },
  computed: {
    ...mapState(['lastRanking']),
    list() {
      if (this.tag === 'lands') {
        return this.lastRanking.sort((a, b) => b.statistics.land - a.statistics.land)
      }
      if (this.tag === 'profit') {
        // console.log(this.lastRanking);
        return this.lastRanking.sort((a, b) => {
          // console.log(b.profit);
          // console.log(a.profit);
          return (Number)((BigInt(b.profit) - BigInt(a.profit)).toString())
        });
      }
    }
  }
}
</script>

<template>
  <div class="combg">
    <div class="titc com_flex3"><img src="../../public/images/ico2.png"/>
      <em>Profit Last Ranking</em>
      <a href="javascript:;" class="sx_ico com_flex2" @click="onClickChange">
        <img src="../../public/images/ico0.png"/>
      </a>
    </div>
    <div class="list ranking">
      <div class="list_top com_flex">
        <div class="w1">Ranking</div>
        <div class="w2">ID</div>
        <div class="w2">{{ tag === 'lands' ? 'Lands' : "Profit" }}</div>
      </div>
      <ul>
        <li class="com_flex" v-for="item in list">
          <div class="w1 com_flex2"><img src="../../public/images/n1.png"/></div>
          <div class="w2">{{ shortend(item.owner) }}</div>
          <div class="w2">{{ tag === 'lands' ? item.statistics.land : formatEther(item.profit) }}</div>
        </li>
      </ul>
    </div>
  </div>
  <!--  <div class="mycard">-->
  <!--    <el-card class="box-card">-->
  <!--      <template #header>-->
  <!--        <div class="card-header">-->
  <!--          <el-icon color="white" class="no-inherit">-->
  <!--            <Rank/>-->
  <!--          </el-icon>-->
  <!--          <span> Last Ranking</span>-->
  <!--          <div style="float: right">-->
  <!--            <el-button @click="onClickProfit">Profit</el-button>-->
  <!--            <el-button @click="onClickLands">Lands</el-button>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--      </template>-->
  <!--      <el-table :data="list" style="width: 100%">-->
  <!--        <el-table-column type="index" width="50"/>-->
  <!--        <el-table-column prop="owner" label="ID">-->
  <!--          <template #default="scope">-->

  <!--            <el-popover effect="light" trigger="hover" placement="top" width="auto">-->
  <!--              <template #default>-->
  <!--                <div> {{ (scope.row.owner) }}</div>-->
  <!--              </template>-->
  <!--              <template #reference>-->
  <!--                {{ shortend(scope.row.owner) }}-->
  <!--              </template>-->
  <!--            </el-popover>-->

  <!--          </template>-->
  <!--        </el-table-column>-->
  <!--        <el-table-column prop="statistics.land" label="Lands" v-if="tag==='lands'"/>-->
  <!--        <el-table-column prop="profit" label="Profit" v-if="tag==='profit'">-->
  <!--          <template #default="scope">-->
  <!--            <div> {{ formatEther(scope.row.profit) }}</div>-->
  <!--          </template>-->
  <!--        </el-table-column>-->
  <!--      </el-table>-->
  <!--    </el-card>-->
  <!--  </div>-->
</template>

<style scoped>

</style>