<template>
  <div class="m_md_top com_flex">
    <div class="mdl com_flex3">
      <img src="../../public/images/ico5.png"/>
      <em class="com_flex3">
        <img src="../../public/images/ico7.png"/><i>Jackpot(BTC):</i>
        <font>
          <JackPot/>
        </font>
      </em>

      <em class="com_flex3">
        <img src="../../public/images/ico7_2.png"/><i style="color: #ff961b">Total bonus(BTC):</i>
        <font>
          <TotalJackPot/>
        </font>
      </em>

    </div>

<!--    <div class="mdl com_flex3">-->
<!--      <img src="../../public/images/ico5.png"/>-->


<!--    </div>-->




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
import TotalJackPot from "./TotalJackPot.vue";

export default {
  name: "StatusBar",
  components: {
    CountDown, NextRound, JackPot, TotalJackPot
  },
  computed: {
    ...mapState(['wallet_address', 'conn', 'turn']),
  },
}
</script>

<style scoped>

</style>