import { ref } from 'vue'

export const payments       = ref([])
export const paymentGroups  = ref([])

export const fetchAllPayments = async (supabase) => {
  const [
    { data: pData, error: pErr },
    { data: gData, error: gErr }
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('id, card_name, amount_paid, date, group_id')
      .order('date', { ascending: false }),

    supabase
      .from('payment_groups')
      .select(`
        id,
        date,
        starting_balance,
        note,
        payments (
          id,
          card_name,
          amount_paid
        )
      `)
      .order('date', { ascending: false })
  ])

  if (!pErr) payments.value = pData
  else console.error('Error fetching payments:', pErr)

  if (!gErr) paymentGroups.value = gData
  else console.error('Error fetching payment groups:', gErr)
}