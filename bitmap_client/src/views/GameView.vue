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
    async onClickEquip() {
      alert("asd")
    },
    onClickStartGame() {

      this.conn.send('some data');
      // 如果fomat配置为了json，即可调用sendObj方法来发送数据
      this.conn.sendObj({awesome: 'data'});

      this.conn.sendObj(
          {
            method: "GameStart"
          }
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
