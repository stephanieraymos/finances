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

<style>
.life-dash {
    padding: 0.25rem;
    text-align: center;
}
</style>