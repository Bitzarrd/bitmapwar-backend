<script>
import {Histogram} from "@element-plus/icons-vue";
import {mapState} from "vuex";

export default {
  name: "LandList",
  components: {Histogram},
  computed:{
    ...mapState(['landList']),
  }
}
</script>

<template>
  <div class="combg">
    <div class="titc com_flex3"><img src="images/ico1.png" /><em>Land List</em></div>
    <div class="list">
      <div class="list_top com_flex">
        <div class="w0">Team</div>
        <div class="w1">Land</div>
        <div class="w1">Soldier</div>
        <div class="w1">Loss</div>
      </div>
      <ul>
        <li class="com_flex" v-for="item in landList">
          <div class="w0 com_flex2"><i class="ibg ibg1" :style="{ backgroundColor: item.team }"></i></div>
          <div class="w1">{{item.land}}</div>
          <div class="w1">{{item.virus}}</div>
          <div class="w1">{{item.loss}}</div>
        </li>
      </ul>
    </div>
  </div>
<!--  <div class="mycard">-->
<!--    <el-card class="box-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <el-icon color="white" class="no-inherit">-->
<!--            <Histogram/>-->
<!--          </el-icon>-->
<!--          <span> Land List</span>-->
<!--        </div>-->
<!--      </template>-->
<!--      <el-table :data="landList" style="width: 100%">-->
<!--        <el-table-column prop="team" label="Team">-->
<!--          <template #default="scope">-->
<!--            <div class="team" :style="{ backgroundColor: scope.row.team }"></div>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="land" label="Land"/>-->
<!--        <el-table-column prop="virus" label="Soldier"/>-->
<!--        <el-table-column prop="loss" label="Loss"/>-->
<!--      </el-table>-->
<!--    </el-card>-->
<!--  </div>-->
</template>

<style scoped>

</style>