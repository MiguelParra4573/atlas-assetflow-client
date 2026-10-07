<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="topbar">
    <strong>Atlas AssetFlow</strong>
    <nav>
      <RouterLink to="/activos">Activos</RouterLink>
      <RouterLink to="/ordenes">Órdenes de trabajo</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #ddd;
}
nav {
  display: flex;
  gap: 1rem;
}
main {
  padding: 1.5rem;
}
</style>
