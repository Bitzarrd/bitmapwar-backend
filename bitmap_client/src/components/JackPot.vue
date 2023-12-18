<script>
import {mapState} from "vuex";

export default {
  name: "JackPot",
  computed: {
    ...mapState(['players']),
    value: {
      get() {
        let result = 0;
        for (let i = 0; i < this.players.length; i++) {
          result += this.players[i].init_virus;
        }
        return result;
      },

    }
  }
}
</script>

<template>
  Jackpot(BTC)：{{ value }}
</template>

<style scoped>

</style>