<template>
  <div class="safe-tracker">
    <h2>Safe Balance</h2>
    <p class="current-balance">${{ currentBalance?.toFixed(2) || "0.00" }}</p>

    <form @submit.prevent="addTransaction">
      <input
        type="text"
        v-model="transaction.title"
        placeholder="Title (optional)"
      />
      <input
        type="number"
        v-model.number="transaction.amount"
        placeholder="Amount +/-"
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
        v-model="transaction.tag"
        placeholder="Tag (optional)"
      />
      <input
        type="file"
        @change="handleFileUpload"
        accept="image/*"
      />
      <button type="submit" style="cursor: pointer">Add Transaction</button>
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
        <div v-if="tx.image_url" class="transaction-image">
          <img :src="tx.image_url" alt="Transaction Image" />
        </div>
        <small>({{ formatDate(tx.date || tx.created_at) }})</small>
        <button class="edit-btn" @click="editTransaction(tx.id)">✏️</button>
        <button class="delete-btn" @click="deleteTransaction(tx.id)">🗑️</button>
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
  image_url: "",
});
const route = useRoute();
const highlightId = route.query.highlightId || null;
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected for upload.");
    return;
  }

  const { data, error } = await supabase.storage
    .from("transaction-images")
    .upload(`images/${Date.now()}_${file.name}`, file);

  if (error) {
    console.error("Error uploading file:", error.message);
    return;
  }

  if (!data || !data.path) {
    console.error("Upload failed: No path returned.");
    return;
  }

  console.log("Upload Data:", data); // Debugging: Check the returned data object

  // Manually construct the public URL
  const publicUrl = `https://buzybkcumjlkloiaaqtm.supabase.co/storage/v1/object/public/transaction-images/${data.path}`;
  console.log("Manually Constructed Public URL:", publicUrl);

  transaction.value.image_url = publicUrl;
};

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
  const previous = currentBalance.value;
  const after = previous + transaction.value.amount;

  await supabase.from("safe_transactions").insert([
    {
      amount: transaction.value.amount,
      note: transaction.value.note || null,
      title: transaction.value.title || null,
      tag: transaction.value.tag || null,
      image_url: transaction.value.image_url || null,
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
    image_url: "",
  };
};
const deleteTransaction = async (id) => {
  const tx = transactions.value.find((t) => t.id === id);
  if (!tx) return;

  const previous = currentBalance.value;
  const after = previous - tx.amount;

  await supabase.from("safe_transactions").delete().eq("id", id);
  await supabase.from("safe_balance").insert([{ balance: after }]);

  currentBalance.value = after;
  await fetchTransactions();
  if (highlightId === id) {
    route.query.highlightId = null; // Clear highlight if deleted
  }
  transaction.value = {
    amount: null,
    note: "",
    title: "",
    tag: "",
  };
};

const editTransaction = (tx) => {
    const transactionToEdit = transactions.value.find((t) => t.id === tx);
    if (!transactionToEdit) return;
    
    transaction.value = {
        amount: transactionToEdit.amount,
        note: transactionToEdit.note || "",
        title: transactionToEdit.title || "",
        tag: transactionToEdit.tag || "",
    };

    const element = document.getElementById(`safe-${tx}`);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }

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
  background: var(--cards);
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

button {
  padding: 0.6rem;
  font-weight: bold;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: var(--cards);
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  padding: 0.75rem;
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
  0% {
    background-color: #fff8c4;
  }
  100% {
    background-color: transparent;
  }
}
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
}
.transaction-image img {
  max-width: 100px;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
