<template>
  <nav>
    <router-link to="financials" :class="{ active: isActive('financials') }">Financials</router-link>
    <router-link to="money" :class="{ active: isActive('money') }">Money</router-link>
    <router-link to="life" :class="{ active: isActive('life') }">Life</router-link>
    <router-link to="relationship" :class="{ active: isActive('relationship') }">Relationship</router-link>
  </nav>
  <router-view />
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const isActive = (tab) => route.path.includes(tab);
</script>

<style scoped lang="scss">
nav {
  display: flex;
  gap: 0px;
  margin-bottom: 20px;
}
nav a {
  padding: 5px;
  text-decoration: none;
  color: var(--text-primary);
  background-color: var(--shade-3);
  transition: background-color 0.3s, color 0.3s;
}
.router-link-active,
.active {
  background-color: var(--color-blue);
  color: var(--text-primary);
}
</style>
