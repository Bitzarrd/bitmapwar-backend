<script>
import {mapState} from "vuex";
import {shortend} from "../utils";

export default {
  name: "LastRanking",
  methods: {shortend},
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
        <el-table-column prop="owner" label="ID">
          <template #default="scope">

            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div> {{ (scope.row.owner) }}</div>
              </template>
              <template #reference>
                {{ shortend(scope.row.owner) }}
              </template>
            </el-popover>

          </template>
        </el-table-column>
        <el-table-column prop="land" label="Lands"/>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>

</style>