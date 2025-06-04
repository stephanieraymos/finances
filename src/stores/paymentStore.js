import { ref } from 'vue'

export const payments = ref([])

export const fetchPayments = async (supabase) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('date', { ascending: false })
  if (!error) payments.value = data
}