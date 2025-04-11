<script setup lang="ts">
import Content from './components/Content.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
  </header>

  <main>
    <Content />
  </main>
</template>

<style lang="css" scoped>
header, main {
  display: block;
}
</style>