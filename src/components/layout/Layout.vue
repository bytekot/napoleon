<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="layout">
    <header class="header"></header>
    <main>
      <slot />
    </main>
    <footer class="footer"></footer>
  </div>
</template>

<style scoped lang="scss">
.layout {
  background-color: #eee;
  height: 100%;

  main {
    height: 100%;
  }
}

.header {
  background-color: #fff;
}

.footer {
  background-color: #fff;
}
</style>
