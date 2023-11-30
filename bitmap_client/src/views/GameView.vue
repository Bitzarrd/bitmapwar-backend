<script>
import MapRender from "@/components/MapRender.vue";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "GameView",
  components: {MapRender},
  computed: {
    ...mapState(['socket', 'conn']),
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
    onClickStartGame() {
      // this.conn.sendObj(
      //     {
      //       method: "StartGame"
      //     }
      // );

      this.conn.send(
          JSON.stringify(
              {
                method: "StartGame"
              }
          )
      );
    }
  }
}
</script>

<template>
  <div>
    <div>
      <span style="margin-right: 10px;">Socket Connect: {{ socket.isConnected ? "YES" : socket.reconnectError }}</span>
      <el-button @click="onClickStartGame">Start Game</el-button>
    </div>
    <div>
      <MapRender></MapRender>
    </div>
  </div>
</template>

<style>

</style>
