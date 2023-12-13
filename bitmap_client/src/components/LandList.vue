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
  <div class="mycard">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <el-icon color="white" class="no-inherit">
            <Histogram/>
          </el-icon>
          <span> Land List</span>
        </div>
      </template>
      <el-table :data="landList" style="width: 100%">
        <el-table-column prop="team" label="Team">
          <template #default="scope">
            <div class="team" :style="{ backgroundColor: scope.row.team }"></div>
          </template>
        </el-table-column>
        <el-table-column prop="land" label="Land"/>
        <el-table-column prop="virus" label="Bit"/>
        <el-table-column prop="loss" label="Loss"/>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>

</style>