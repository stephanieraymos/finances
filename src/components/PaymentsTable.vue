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
          <th></th>
          <!-- for delete button -->
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in filteredPayments" :key="p.id">
          <td>{{ formatDate(p.date) }}</td>
          <td :style="{ color: colorFor(p.card_name) }">{{ labelFor(p.card_name) }}</td>
          <td>${{ Number(p.amount_paid).toFixed(2) }}</td>
          <td>
            <button class="delete" @click="deletePayment(p.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { payments, fetchPayments } from "@/stores/paymentStore";
import { bills, fetchBills } from '@/stores/billStore';
import dayjs from "dayjs";

const activeTab = ref("Last Payment");
const tabs = ["Last Payment", "Last Week", "This Month", "All Payments"];


onMounted(() => {
  fetchPayments(supabase);
  fetchBills();
});

const labelFor = (name) => {
  const match = bills.value.find((b) => b.name === name);
  return match?.label || name;
};

const colorFor = (name) => {
  const match = bills.value.find((b) => b.name === name);
  return match?.color || '#333';
};

const formatDate = (d) => {
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Prevent timezone shift for raw YYYY-MM-DD strings
    const [year, month, day] = d.split("-");
    return `${month}/${day}/${year}`;
  }
  return new Date(d).toLocaleDateString();
};

const emit = defineEmits(['payment-deleted']);

const deletePayment = async (id) => {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    console.error("❌ Delete failed:", error.message);
  } else {
    await fetchPayments(supabase); // refresh list
    emit('payment-deleted'); // Notify parent
  }
};


const filteredPayments = computed(() => {
  const today = dayjs();
  switch (activeTab.value) {
    case 'Last Payment':
      const latestDate = payments.value[0]?.date;
      return payments.value.filter((p) => p.date === latestDate);
    case 'Last Week':
      const lastWeek = today.subtract(7, 'day');
      return payments.value.filter((p) => dayjs(p.date).isAfter(lastWeek));
    case 'This Month':
      return payments.value.filter((p) => {
        const d = dayjs(p.date);
        return d.month() === today.month() && d.year() === today.year();
      });
    default:
      return payments.value;
  }
});
</script>

<style scoped lang="scss">
.payments-table {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: "Inter", sans-serif;

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

    th,
    td {
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
  button.delete {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #d11a2a;
    transition: color 0.2s;

    &:hover {
      color: #a00;
    }
  }
}
</style>
