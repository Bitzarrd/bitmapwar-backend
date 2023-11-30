<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "GameView",
  components: {MapRender},
  computed: {
    ...mapState(['']),
  },
  data() {
    return {
      loading: false
    }
  },
  mounted() {

  },
  methods: {
    ...mapActions([]),
    ...mapMutations([]),
    async onClickEquip() {
      alert("asd")
    },
    onClickStartGame() {
      this.$socket.sendObj(
          {
            msg: "start"
          }
      );
    }
  }
}
</script>

<template>
  <div>
    <div>
      <el-button @click="onClickStartGame">Start Game</el-button>
    </div>
    <div>
      <MapRender></MapRender>
    </div>
  </div>
</template>

<style>

</style>
