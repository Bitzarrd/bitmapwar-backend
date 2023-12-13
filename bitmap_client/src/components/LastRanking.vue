<script>
import {mapState} from "vuex";

export default {
  name: "LastRanking",
  computed: {
    ...mapState(['lastRanking'])
  }
}
</script>

<template>
  <div class="mycard">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <el-icon color="white" class="no-inherit">
            <Rank/>
          </el-icon>
          <span> Last Ranking</span>
        </div>
      </template>
      <el-table :data="lastRanking" style="width: 100%">
        <el-table-column type="index" width="50"/>
        <el-table-column prop="id" label="ID"/>
        <el-table-column prop="lands" label="Lands"/>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>

</style>