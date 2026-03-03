// billStore.js
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export const bills = ref([]);

export const fetchBills = async () => {
  const { data, error } = await supabase
    .from('bills')
    .select('name, label, color, due_day_of_month')
    .order('label');
  if (error) {
    console.error('❌ Error fetching bills:', error.message);
  } else {
    bills.value = data;
  }
};
