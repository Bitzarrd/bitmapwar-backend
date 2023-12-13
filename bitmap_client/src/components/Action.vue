<script>
import {shortend} from "@/utils";
import {mapState} from "vuex";

export default {
  name: "Action",
  computed:{
    ...mapState(['wallet_address', 'user'])
  },
  data() {
    return {
      options:
          [
            {
              value: 'red',
              label: 'Red',
            },
            {
              value: 'blue',
              label: 'Blue',
            },
            {
              value: 'green',
              label: 'Green',
            },
            {
              value: 'purple',
              label: 'Purple',
            },
          ]
    }
  },
  methods:{
    shortend,
    onClickSubmit() {
      this.dialogVisible = true
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
            <Edit/>
          </el-icon>
          <span> Action</span>
        </div>
      </template>
      <el-form label-width="80px" v-if="wallet_address">
        <el-form-item label="Function:">
          <el-select v-model="value" class="m-2" placeholder="Select">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
                        <span :style="{ color: item.value }">
                          {{ item.label }}
                        </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Bitmap:">
          <el-input :value="selected_map" disabled/>
        </el-form-item>
        <el-form-item label="Owner:">
          <el-input :value="shortend(wallet_address)" disabled/>
        </el-form-item>
        <el-form-item label="Bit:">
          <el-input-number :controls="false" :min="1" v-model="virus"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: right;" v-if="wallet_address">
          <el-button @click="onClickSubmit">Submit</el-button>
        </div>
      </template>

    </el-card>
  </div>
</template>

<style scoped>

</style>