<template>
  <div class="dashboard">
    <div class="last-paid" v-if="lastPayment">
      <h3>Last Payment</h3>
      <p>
        <strong>Date:</strong>
        {{ lastPayment.created_at?.slice(0, 10) || "N/A" }}
      </p>
      <p><strong>Total Paid:</strong> ${{ totalPaid }}</p>
      <p><strong>Starting Balance:</strong> ${{ lastPayment.c_start }}</p>
      <p><strong>Leftover:</strong> ${{ leftover }}</p>
    </div>
    <div class="last-paid" v-else>
      <h3>Last Payment</h3>
      <p>No payments saved yet.</p>
    </div>

    <h2>Upcoming Bills</h2>
    <ul class="bill-list">
      <li
        class="bill-item"
        v-for="bill in sortedBills"
        :key="bill.id"
        :style="{ color: bill.color }"
      >
        <span class="bill-name">{{ bill.name }}</span>
        <span class="bill-days">due in {{ bill.daysLeft }} days</span>
      </li>
    </ul>

    <payments-form />
    <payments-table />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase.js";
import PaymentsForm from "./PaymentsForm.vue";
import PaymentsTable from "./PaymentsTable.vue";

const bills = ref([]);
const lastPayment = ref(null);

const fetchBills = async () => {
  const { data, error } = await supabase.from("bills").select("*");
  if (error) console.error("Error fetching bills:", error);
  else bills.value = data;
};

const fetchLastPayment = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) console.error("Error fetching last payment:", error);
  else lastPayment.value = data;
};

const daysUntilDue = (dueDay) => {
  const today = new Date();
  const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (due < today) due.setMonth(due.getMonth() + 1);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

const sortedBills = computed(() => {
  return bills.value
    .map((bill) => ({
      ...bill,
      daysLeft: daysUntilDue(bill.due_day_of_month),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
});

const totalPaid = computed(() => {
  if (!lastPayment.value) return 0;
  const keys = Object.keys(lastPayment.value).filter(
    (key) =>
      key.endsWith("_paid") ||
      [
        "amz",
        "pp",
        "ven",
        "wf_ac",
        "disc",
        "apple",
        "attune",
        "car",
        "lovesac",
      ].includes(key)
  );
  return keys.reduce(
    (sum, key) => sum + (Number(lastPayment.value[key]) || 0),
    0
  );
});

const leftover = computed(() => {
  if (!lastPayment.value) return 0;
  return Number(lastPayment.value.c_start || 0) - totalPaid.value;
});

onMounted(() => {
  fetchBills();
  fetchLastPayment();
});
</script>

<style scoped lang="scss">
.dashboard {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f7f9fb, #eaf1f8);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: "Inter", sans-serif;

  h2 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #222;
  }

  .bill-list {
    list-style: none;
    padding: 0;

    .bill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      margin-bottom: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.6rem;
      font-weight: 500;
      font-size: 1.05rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .bill-name {
        font-weight: 600;
      }

      .bill-days {
        font-style: italic;
        font-size: 0.95rem;
      }
    }
  }
}
.last-paid {
  background: #eef4ff;
  border: 1px solid #dbeafe;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  font-family: "Inter", sans-serif;

  h3 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
    color: #1e3a8a;
  }

  p {
    margin: 0.25rem 0;
    font-size: 0.95rem;

    strong {
      color: #334155;
    }
  }
}
</style>
