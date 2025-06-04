<template>
  <div>
    <h2>Add Week</h2>
    <form @submit.prevent="addWeek">
      <label>Start Date:</label>
      <input type="date" v-model="startDate" required />
      <label>Checking Balance:</label>
      <input type="number" v-model="checkingBalance" required />
      <button type="submit">Save Week</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const startDate = ref('');
const checkingBalance = ref('');

const addWeek = async () => {
  const { error } = await supabase.from('weeks').insert([{
    start_date: startDate.value,
    checking_balance: checkingBalance.value
  }]);
  if (error) alert(error.message);
  else alert('Week added!');
};
</script>