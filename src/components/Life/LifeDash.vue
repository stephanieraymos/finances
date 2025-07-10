<template>
    <div class="life-dash">
        <h1>Life Dashboard</h1>
        <things-to-do />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ThingsToDo from './ThingsToDo.vue';

const message = ref('Track your progress here!');
</script>

<style scoped>
.life-dash {
    padding: 20px;
    text-align: center;
}

h1 {
    color: #4CAF50;
}

p {
    color: #555;
}
</style>