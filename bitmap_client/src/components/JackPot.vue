<script>
import {mapState} from "vuex";
import {formatEther} from "ethers";
import {calculate_virus_to_profit} from "@/utils";

export default {
  name: "JackPot",
  methods: {formatEther},
  computed: {
    ...mapState(['players']),
    value: {
      get() {
        let result = 0;
        for (let i = 0; i < this.players.length; i++) {
          result += this.players[i].init_virus;
        }


        return calculate_virus_to_profit(result);
      },

    }
  }
}
</script>

<template>
  {{ formatEther(value) }}
</template>

<style scoped>

</style>