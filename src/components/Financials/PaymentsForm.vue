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
      <div class="form-group">
        <label for="note">Note</label>
        <input id="note" type="text" v-model="form.note" />
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
import { reactive, ref, computed, onMounted, defineEmits, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { bills, fetchBills } from "@/stores/billStore";
import {
  fetchAllPayments,
  paymentGroups,
  payments,
} from "@/stores/paymentStore";
import dayjs from "dayjs";

const emit = defineEmits(["payment-saved"]);

onMounted(async () => {
  await fetchBills();
  await fetchAllPayments(supabase);
});

const today = dayjs().startOf("day");
const todayString = today.format("YYYY-MM-DD");

const form = reactive({
  date: todayString,
  c_start: null,
  note: null
});

// whenever date changes (or payments load), auto-fill c_start
watch(
  [() => form.date, () => paymentGroups.value],
  ([newDate]) => {
    const batch = paymentGroups.value.find((g) => g.date === newDate);
    form.c_start = batch ? batch.starting_balance : null;
    form.note = batch ? batch.note : null;
  },
  { immediate: true }
);

const message = ref("");

const remainingBalance = computed(() => {
  const totalPaid = bills.value.reduce((sum, bill) => {
    return sum + (Number(form[bill.name]) || 0);
  }, 0);
  return (Number(form.c_start) || 0) - totalPaid;
});

const isDueSoon = (dueDay) => {
  if (!dueDay) return false;

  // this month’s dueDay
  let due = dayjs().date(dueDay).startOf("day");

  // if that date already passed, bump to next month
  if (due.isBefore(today)) {
    due = due.add(1, "month");
  }
  return due.diff(today, "day") <= 7;
};

const submitPayments = async () => {
  // upsert the group row and get back its id
  const {
    data: batch,
    error: batchErr,
  } = await supabase
    .from("payment_groups")
    .upsert(
      {
        date: form.date,
        starting_balance: form.c_start,
        note: form.note || null,
      },
      { onConflict: "date" }
    )
    .select("id")
    .single();
  if (batchErr) {
    message.value = "❌ Could not save group: " + batchErr.message;
    return;
  }

  // insert individual payment lines
  const toInsert = bills.value
    .filter((b) => form[b.name] > 0)
    .map((b) => ({
      date: form.date,
      card_name: b.name,
      amount_paid: form[b.name],
      group_id: batch.id,
    }));

  const { error: payErr } = await supabase.from("payments").insert(toInsert);
  if (payErr) {
    message.value = "❌ Could not save payments: " + payErr.message;
  } else {
    message.value = "✅ Saved!";
    await fetchAllPayments(supabase);
    // reset form
    form.date = todayString;
    form.c_start = null;
    form.note = null;
    bills.value.forEach((bill) => (form[bill.name] = null));
  }
};
</script>

<style scoped lang="scss">
.payment-form {
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--cards);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    text-align: center;
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
      }

      input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        background: rgba(128, 128, 128, 0.1);
        border-radius: 0.5rem;
        font-size: 1rem;
        text-align: right;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
      }
    }
    input.due-soon {
      border: 1px solid var(--color-red);
      background: linear-gradient(
        to right,
        rgba(255, 0, 0, 0.061),
        rgba(255, 0, 0, 0.05)
      );
      color: var(--text-primary);
    }
    button {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--color-blue);
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;

      &:hover {
        background: var(--color-blue);
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
    color: var(--color-blue);
    justify-content: space-between;

    span {
      flex: 1;
      text-align: right;
    }
  }
}
</style>
