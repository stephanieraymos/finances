<template>
  <div class="safe-tracker">
    <h2>Safe Balance</h2>
    <p class="current-balance">${{ currentBalance?.toFixed(2) || "0.00" }}</p>

    <form @submit.prevent="addTransaction">
      <input
        type="number"
        v-model.number="transaction.amount"
        placeholder="Amount"
        step="0.01"
        required
      />
      <input
        type="text"
        v-model="transaction.note"
        placeholder="Note (optional)"
      />
      <input
        type="text"
        v-model="transaction.title"
        placeholder="Title (optional)"
      />
      <input
        type="text"
        v-model="transaction.tag"
        placeholder="Tag (optional)"
      />
      <button type="submit">Add Transaction</button>
    </form>

    <h3>Transaction History</h3>
    <ul>
      <li
        v-for="tx in transactions"
        :key="tx.id"
        :id="`safe-${tx.id}`"
        :class="{ highlight: tx.id === highlightId }"
      >
        <span :class="{ positive: tx.amount > 0, negative: tx.amount < 0 }">
          {{ tx.amount > 0 ? "+" : "" }}${{ Math.abs(tx.amount).toFixed(2) }}
        </span>
        <em v-if="tx.note">– {{ tx.note }}</em>
        <div v-if="tx.title || tx.tag" class="meta">
          <strong v-if="tx.title">{{ tx.title }}</strong>
          <small v-if="tx.tag">[{{ tx.tag }}]</small>
        </div>
        <div
          v-if="tx.total_before !== null && tx.total_after !== null"
          class="balance-info"
        >
          <small
            >Total before: ${{ tx.total_before }} → after: ${{
              tx.total_after
            }}</small
          >
        </div>
        <div v-if="tx.sales_reference" class="linked-sale">
          <!-- route to sold item in Sold.vue -->
          <router-link :to="`/sold?highlightId=${tx.sales_reference}`">
            Linked Sale
          </router-link>
        </div>
        <small>({{ formatDate(tx.date || tx.created_at) }})</small>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/lib/supabase";

const currentBalance = ref(0);
const transactions = ref([]);
const transaction = ref({
  amount: null,
  note: "",
  title: "",
  tag: "",
});
const route = useRoute();
const highlightId = route.query.highlightId || null;

const fetchBalance = async () => {
  const { data } = await supabase
    .from("safe_balance")
    .select("balance")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (data) currentBalance.value = data.balance;
};

const fetchTransactions = async () => {
  const { data } = await supabase
    .from("safe_transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (data) transactions.value = data;
};

const addTransaction = async () => {
  if (transaction.value.amount === 0) return;

  const previous = currentBalance.value;
  const after = previous + transaction.value.amount;

  await supabase.from("safe_transactions").insert([
    {
      amount: transaction.value.amount,
      note: transaction.value.note || null,
      title: transaction.value.title || null,
      tag: transaction.value.tag || null,
      total_before: previous,
      total_after: after,
    },
  ]);

  await supabase.from("safe_balance").insert([{ balance: after }]);

  currentBalance.value = after;
  await fetchTransactions();

  transaction.value = {
    amount: null,
    note: "",
    title: "",
    tag: "",
  };
};

const formatDate = (d) => new Date(d).toLocaleDateString();
onMounted(async () => {
  await fetchBalance();
  await fetchTransactions();
});
</script>

<style scoped>
.safe-tracker {
  max-width: 700px;
  margin: auto;
  padding: 1rem;
}

.current-balance {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1e3a8a;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

input[type="number"],
input[type="text"] {
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

button {
  padding: 0.6rem;
  font-weight: bold;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  position: relative;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.meta {
  font-size: 0.9rem;
  color: #444;
}

.balance-info {
  font-size: 0.8rem;
  color: #888;
}

.linked-sale {
  margin-top: 0.25rem;
}

.highlight {
  animation: highlightFade 2s ease-in-out;
  background: #fff8c415;
  border-left: 5px solid #f4d03f;
  color: black;
  padding-left: 0.5rem;
}
@keyframes highlightFade {
  0% { background-color: #fff8c4; }
  100% { background-color: transparent; }
}
</style>
