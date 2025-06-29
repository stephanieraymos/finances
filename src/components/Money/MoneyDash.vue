<template>
    <div class="money-dash">
        <h1>Money Dashboard</h1>
        <p>Track your finances here.</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const balance = ref(0);
const transactions = ref([]);

function addTransaction(amount) {
    transactions.value.push(amount);
    balance.value += amount;
}
</script>

<style scoped>
.money-dash {
    padding: 20px;
    font-family: Arial, sans-serif;
}

h1 {
    color: #2c3e50;
}

p {
    color: #34495e;
}
</style>