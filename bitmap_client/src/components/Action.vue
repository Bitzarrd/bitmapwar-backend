<script>
import {shortend} from "@/utils";
import {mapMutations, mapState} from "vuex";
import {Edit} from "@element-plus/icons-vue";

export default {
  name: "Action",
  components: {Edit},
  computed: {
    ...mapState(['wallet_address', 'user', 'selected_map', 'players', 'selected_color']),
    colorLocked: {
      get() {
        const my_player = this.players.find(player => player.owner === this.wallet_address);
        console.log("my_player", my_player);
        if (my_player != null) {
          return my_player.color;
        } else {
          return null;
        }
      },
    },
    color: {
      get() {
        return this.selected_color;
      },
      set(val) {
        this.setSelectColor(val);
      }
    }
  },
  data() {
    return {
      virus: 0,
      lock: false,
      options: [
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
  watch: {
    virus(newValue, oldValue) {
      this.setVirus(newValue);
    },
    colorLocked(newValue, oldValue) {
      if (newValue != null) {
        this.lock = true;
        this.color = newValue;
      } else {
        this.lock = false;
      }
    },
  },
  mounted() {

  },
  methods: {
    shortend,
    ...mapMutations(['setActionDialogVisible', 'setVirus', 'setSelectColor']),
    onClickSubmit() {
      this.setActionDialogVisible(true);
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
          <el-select v-model="color" class="m-2" placeholder="Select" :disabled="lock">
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
          <el-tooltip
              class="box-item"
              effect="dark"
              :content="wallet_address"
              placement="top"
          >
            <el-input :value="shortend(wallet_address)" disabled/>
          </el-tooltip>
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