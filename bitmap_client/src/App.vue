<script setup>
import MapRender from "@/components/MapRender.vue";
</script>

<template>
  <div>
    <div>
      <el-button>Connect to server</el-button>
      <el-button>Start Game</el-button>
    </div>
    <div>
      <MapRender></MapRender>
    </div>
  </div>
</template>

<style scoped>
body{
  margin: 0;
}
</style>
