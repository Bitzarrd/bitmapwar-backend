<template>
  {{ countdown }}
</template>

<script>
import {mapState} from "vuex";

export default {
  data() {
    return {
      countdown: '00:00',
    };
  },
  computed: {
    ...mapState(['next_round', 'server_time_delta'])
  },
  mounted() {
    this.startCountdown();
  },
  methods: {
    startCountdown() {
      const intervalId = setInterval(() => {
        const now = Math.floor(Date.now() / 1000) - this.server_time_delta;
        const remainingTime = this.next_round - now;

        if (remainingTime > 0) {
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          this.countdown = `${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
        } else {
          this.countdown = '00:00';
          // clearInterval(intervalId);
        }
      }, 1000);
    },
    formatTime(value) {
      return value < 10 ? `0${value}` : value;
    },
  },
};
</script>