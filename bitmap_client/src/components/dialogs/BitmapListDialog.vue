<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "BitmapListDialog",
  computed: {
    ...mapState([
      'bitmapListDialogVisible', 'map_list','conn'
    ]),
    dialogVisible: {
      get() {
        return this.bitmapListDialogVisible
      },
      set(val) {
        this.setBitmapListDialogVisible(val)
      }
    },
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
      selected_map: ""
    }
  },
  watch: {
    // selected_map: function (newVal, oldVal) {
    //   this.setSelectedMap(newVal);
    // }
  },
  mounted() {
    // this.conn.sendObj({method: "LoadMap2"});
  },
  methods: {
    ...mapMutations(['setBitmapListDialogVisible', 'setSelectedMap']),
    selectChange(e) {
      console.log(e)
    },
    onClickConfirm() {

      this.setSelectedMap(this.selected_map);
      this.$emit('search', this.selected_map);

      this.setBitmapListDialogVisible(false);
    }
  }
}
</script>

<template>
  <el-dialog
      v-model="dialogVisible"
      title="Bitmap List"
      width="30%"
  >
    <el-form label-width="100px">
      <el-form-item label="Maps">
        <el-select v-model="selected_map" filterable placeholder="Select" @change="selectChange">
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
        <el-button @click="setBitmapListDialogVisible(false)">Cancel</el-button>
        <el-button type="primary" @click="onClickConfirm">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>