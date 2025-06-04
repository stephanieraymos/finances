<template>
  <div class="payments-table">
    <h2>Payment History</h2>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="filteredPayments.length === 0" class="no-payments">
      No payments found.
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Date</th>
          <th>Card</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredPayments" :key="p.id">
          <td>{{ formatDate(p.date) }}</td>
          <td>{{ labelFor(p.card_name) }}</td>
          <td>${{ Number(p.amount_paid).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const payments = ref([])
const activeTab = ref('Last Payment')

const tabs = ['Last Payment', 'Last Week', 'This Month', 'All Payments']

const labelFor = (key) => {
  const map = {
    amz: 'Amazon',
    pp: 'PayPal',
    ven: 'Venmo',
    wf_ac: 'WF Active Cash',
    disc: 'Discover',
    apple: 'Apple',
    attune: 'WF Attune',
    car: 'Car',
    lovesac: 'Lovesac'
  }
  return map[key] || key
}

const formatDate = (d) => new Date(d).toLocaleDateString()

const fetchPayments = async () => {
  const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false })
  if (error) console.error('Error fetching payments:', error)
  else payments.value = data
}

const filteredPayments = computed(() => {
  const today = new Date()
  const now = today.getTime()

  switch (activeTab.value) {
    case 'Last Payment':
      const latestDate = payments.value[0]?.date
      return payments.value.filter(p => p.date === latestDate)
    case 'Last Week':
      const lastWeek = new Date(now - 7 * 86400000)
      return payments.value.filter(p => new Date(p.date) >= lastWeek)
    case 'This Month':
      return payments.value.filter(p => {
        const date = new Date(p.date)
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
      })
    default:
      return payments.value
  }
})

onMounted(fetchPayments)
</script>

<style scoped lang="scss">
.payments-table {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', sans-serif;

  h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
  }

  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;

    button {
      margin: 0.4rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 0.5rem;
      background-color: #e4e8f0;
      cursor: pointer;
      font-weight: 500;

      &.active {
        background-color: #005b96;
        color: white;
      }
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f1f4f8;
    }
  }

  .no-payments {
    text-align: center;
    color: #999;
    padding: 1rem;
    font-style: italic;
  }
}
</style>
