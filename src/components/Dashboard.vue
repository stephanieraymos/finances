<template>
  <div>
    <div>
      <nav>
        <button @click="activeTab = 'financials'" :class="{ active: activeTab === 'financials' }">Financials</button>
        <button @click="activeTab = 'money'" :class="{ active: activeTab === 'money' }">Money</button>
        <button @click="activeTab = 'life'" :class="{ active: activeTab === 'life' }">Life</button>
      </nav>
      <div v-if="activeTab === 'financials'">
        <FinancialsDash />
      </div>
      <div v-if="activeTab === 'money'">
        <MoneyDash />
      </div>
      <div v-if="activeTab === 'life'">
        <LifeDash />
      </div>
    </div>
  </div>
</template>

<script setup>
import FinancialsDash from './Financials/FinancialsDash.vue';
import MoneyDash from './Money/MoneyDash.vue';
import LifeDash from './Life/LifeDash.vue';
import { ref } from 'vue';
const activeTab = ref('financials');


const title = ref('Dashboard');
</script>

<style scoped>
nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
button {
  padding: 10px 20px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}
button.active {
  background-color: var(--color-blue);
  color: white;
}
button:hover {
  background-color: #e0e0e0;
  color: var(--color-blue);
}
</style>