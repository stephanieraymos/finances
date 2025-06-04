<template>
  <div class="payment-form">
    <h2>Weekly Payments</h2>
    <form @submit.prevent="submitPayments">
      <div class="form-group">
        <label for="date">Date:</label>
        <input id="date" type="date" v-model="form.date" />
      </div>

      <div class="form-group">
        <label for="c_start">Starting Balance:</label>
        <input
          id="c_start"
          type="number"
          v-model.number="form.c_start"
          step="0.01"
        />
      </div>

      <div class="form-group" v-for="bill in bills" :key="bill.name">
        <label :for="bill.name" :style="{ color: bill.color || '#444' }">
          {{ bill.label }}:
        </label>
        <input
          :id="bill.name"
          type="number"
          v-model.number="form[bill.name]"
          step="0.01"
          :class="{ 'due-soon': isDueSoon(bill.due_day_of_month) }"
        />
      </div>

      <div class="form-group" v-for="card in cards" :key="card.key">
        <label :for="card.key">{{ card.label }}:</label>
        <input
          :id="card.key"
          type="number"
          v-model.number="form[card.key]"
          step="0.01"
        />
      </div>

      <div class="form-group total">
        <label>Total Remaining:</label>
        <span>${{ remainingBalance.toFixed(2) }}</span>
      </div>

      <button type="submit">💾 Save</button>
    </form>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, defineEmits } from "vue";
import { supabase } from "@/lib/supabase";
import { bills, fetchBills } from "@/stores/billStore";
import { fetchPayments } from "@/stores/paymentStore";

const emit = defineEmits(["payment-saved"]);

onMounted(() => {
  fetchBills();
});

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  date: today,
  c_start: null,
});

const message = ref("");

const remainingBalance = computed(() => {
  const totalPaid = bills.value.reduce((sum, bill) => {
    return sum + (Number(form[bill.name]) || 0);
  }, 0);
  return (Number(form.c_start) || 0) - totalPaid;
});

const isDueSoon = (dueDay) => {
  if (!dueDay) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let due = new Date(now.getFullYear(), now.getMonth(), dueDay);

  // If the due date has already passed this month, bump to next month
  if (due < today) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

const submitPayments = async () => {
  const toInsert = bills.value
    .filter((bill) => form[bill.name] > 0)
    .map((bill) => ({
      date: form.date,
      card_name: bill.name,
      amount_paid: form[bill.name],
      c_start: form.c_start,
    }));

  if (toInsert.length === 0) {
    message.value = "⚠️ No amounts entered.";
    return;
  }

  const { error } = await supabase.from("payments").insert(toInsert);

  if (error) {
    message.value = "❌ Failed to save: " + error.message;
  } else {
    message.value = "✅ Payments saved!";
    await fetchPayments(supabase);
    emit("payment-saved");
    Object.assign(form, { date: today, c_start: null });
    bills.value.forEach((bill) => (form[bill.name] = null));
  }
};
</script>

<style scoped lang="scss">
.payment-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: "Inter", sans-serif;

  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .form-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;

      label {
        flex: 2;
        font-weight: 500;
        color: #444;
      }

      input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        font-size: 1rem;
        text-align: right;

        &:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
      }
    }
    input.due-soon {
      background-color: #ffe5e5 !important;
      border-color: #ff4d4f !important;
    }
    button {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #4a90e2;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;

      &:hover {
        background: #3a78c2;
      }
    }
  }

  .message {
    margin-top: 1rem;
    text-align: center;
    font-weight: 500;
    color: #333;
  }
  .total {
    font-weight: 600;
    color: #1e3a8a;
    justify-content: space-between;

    span {
      flex: 1;
      text-align: right;
    }
  }
}
</style>
