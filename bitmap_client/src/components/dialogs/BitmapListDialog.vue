<script>
import {mapState} from "vuex";

export default {
  name: "BitmapListDialog",
  computed:{
    ...mapState([
      'walletsDialogVisible'
    ]),
    bitmap_list() {
      let origin = this.map_list;
      let result = [];
      for (let i = 0; i < origin.length; i++) {
        // console.log(origin)
        if (i === 0) {
          this.selected_map = origin[i].info.bit_number;
        }
        result.push(
            {
              value: origin[i].info.bit_number,
              label: "#" + origin[i].info.bit_number,
            }
        )
      }
      return result;
    },
  },
  data() {
    return {
    }
  },
  methods:{

  }
}
</script>

<template>
  <el-dialog
      v-model="bitmapListDialogVisible"
      title="Bitmap List"
      width="30%"
  >
    <el-form label-width="100px">
      <el-form-item label="Maps">
        <el-select v-model="selected_map" filterable placeholder="Select">
          <el-option
              v-for="item in bitmap_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="bitmapListDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="bitmapListDialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>