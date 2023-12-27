<template>
  <div class="m_md_top com_flex">
    <div class="mdl com_flex3">
      <img src="images/ico5.png"/>
      <em class="com_flex3">
        <img src="images/ico7.png"/><i>Jackpot(BTC):</i>
        <font><JackPot/></font>
      </em>
    </div>
    <div class="mdr com_flex1">
      <em>Duration:<font class="red">
        <CountDown/>
      </font></em>
      <em>Next Round:<font>
        <NextRound/>
      </font></em>
      <em>Turn:<font>{{ turn }}</font></em>
    </div>
  </div>
</template>

<script>

import {mapState} from "vuex";
import CountDown from "./CountDown.vue";
import NextRound from "./NextRound.vue";
import JackPot from "./JackPot.vue";

export default {
  name: "StatusBar",
  components: {
    CountDown, NextRound,JackPot
  },
  computed: {
    ...mapState(['wallet_address', 'conn', 'turn']),
  },
}
</script>

<style scoped>

</style>