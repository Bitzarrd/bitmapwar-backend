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
      if(this.virus<=0){
        console.warn("this.virus<=0");
        return;
      }
      if(!this.selected_map){
        console.warn("no selected_map");
        return;
      }

      this.setActionDialogVisible(true);
    },
    onClickColor(color) {
      if(this.lock){
        return;
      }
      this.setSelectColor(color);

      console.log("selected_color", color, this.selected_color);
    }
  }
}
</script>

<template>
  <div class="combg" v-if="wallet_address">
    <div class="titc com_flex3">
      <img src="../../public/images/ico4.png"/>
      <em>Action</em>
    </div>
    <ul class="act_form" v-if="wallet_address">
      <li><em>Faction:</em>
        <div class="ck_c com_flex1">
          <span :class="{ 'cur': selected_color==='red' }"><i class="ibg ibg1" @click="onClickColor('red')"
                                                              :style="{ backgroundColor: 'red' }"></i></span>
          <span :class="{ 'cur': selected_color==='blue' }"><i class="ibg ibg2" @click="onClickColor('blue')"
                                                               :style="{ backgroundColor: 'blue' }"></i></span>
          <span :class="{ 'cur': selected_color==='green' }"><i class="ibg ibg3" @click="onClickColor('green')"
                                                                :style="{ backgroundColor: 'green' }"></i></span>
          <span :class="{ 'cur': selected_color==='purple' }"><i class="ibg ibg4" @click="onClickColor('purple')"
                                                                 :style="{ backgroundColor: 'purple' }"></i></span>
        </div>
      </li>
      <li><em>Bitmap:</em>
        <p>{{ selected_map }}</p></li>
      <li><em>Owner:</em>
        <p>{{ shortend(wallet_address) }}</p></li>
      <li><em>Soldier:</em><input class="a_intxt" type="text" v-model="virus"/></li>
    </ul>
    <div class="act_bot"><input type="button" value="Submit" class="submit" @click="onClickSubmit"/></div>
  </div>
  <!--  <div class="mycard">-->
  <!--    <el-card class="box-card">-->
  <!--      <template #header>-->
  <!--        <div class="card-header">-->
  <!--          <el-icon color="white" class="no-inherit">-->
  <!--            <Edit/>-->
  <!--          </el-icon>-->
  <!--          <span> Action</span>-->
  <!--        </div>-->
  <!--      </template>-->
  <!--      <el-form label-width="80px" v-if="wallet_address">-->
  <!--        <el-form-item label="Function:">-->
  <!--          <el-select v-model="color" class="m-2" placeholder="Select" :disabled="lock">-->
  <!--            <el-option-->
  <!--                v-for="item in options"-->
  <!--                :key="item.value"-->
  <!--                :label="item.label"-->
  <!--                :value="item.value"-->
  <!--            >-->
  <!--                        <span :style="{ color: item.value }">-->
  <!--                          {{ item.label }}-->
  <!--                        </span>-->
  <!--            </el-option>-->
  <!--          </el-select>-->
  <!--        </el-form-item>-->
  <!--        <el-form-item label="Bitmap:">-->
  <!--          <el-input :value="selected_map" disabled/>-->
  <!--        </el-form-item>-->
  <!--        <el-form-item label="Owner:">-->
  <!--          <el-tooltip-->
  <!--              class="box-item"-->
  <!--              effect="dark"-->
  <!--              :content="wallet_address"-->
  <!--              placement="top"-->
  <!--          >-->
  <!--            <el-input :value="shortend(wallet_address)" disabled/>-->
  <!--          </el-tooltip>-->
  <!--        </el-form-item>-->
  <!--        <el-form-item label="Soldier:">-->
  <!--          <el-input-number :controls="false" :min="1" v-model="virus"/>-->
  <!--        </el-form-item>-->
  <!--      </el-form>-->
  <!--      <template #footer>-->
  <!--        <div style="display: flex; justify-content: right;" v-if="wallet_address">-->
  <!--          <el-button @click="onClickSubmit">Submit</el-button>-->
  <!--        </div>-->
  <!--      </template>-->

  <!--    </el-card>-->
  <!--  </div>-->
</template>

<style scoped>

</style>