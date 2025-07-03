<template>
  <div class="dashboard">
    <div class="last-paid" v-if="lastGroup">
      <h3>Last Payment Group</h3>
      <p><strong>Date:</strong> {{ formatDate(lastGroup.date) }}</p>
      <p>
        <strong>Starting Balance:</strong> ${{ lastGroup.starting_balance }}
      </p>
      <p><strong>Total Paid:</strong> ${{ totalPaid }}</p>
      <p><strong>Leftover:</strong> ${{ leftover.toFixed(2) }}</p>
      <p>
        <strong>Note: </strong>
        <span v-if="lastGroup.note">{{ lastGroup.note }}</span>
        <span v-else>No note provided.</span>
      </p>
      <h3>Cards Paid</h3>
      <ul>
        <li
          v-for="p in lastGroup.payments"
          :key="p.id"
          :style="{ color: bills.find((b) => b.name === p.card_name)?.color }"
        >
          {{ labelFor(p.card_name) }}: ${{ p.amount_paid }}
        </li>
      </ul>
    </div>
    <div class="last-paid" v-else>
      <h3>Last Payment</h3>
      <p>No payments saved yet.</p>
    </div>
    <div class="plan-btn">
      <button @click="planNextWeek" class="btn btn-primary">
        Due Next Week
      </button>
    </div>
    <NextWeekModal
      v-if="showNextWeekModal"
      :bills="nextWeekBills"
      :extraData="nextWeekExtraData"
      @close="showNextWeekModal = false"
    />

    <h2
      @click="toggleBillsVisibility"
      :class="{ collapsible: true, collapsed: billsCollapsed }"
      style="cursor: pointer; margin-top: 0.5rem"
    >
      Upcoming Bills
    </h2>
    <ul v-show="billsCollapsed" class="bill-list">
      <li class="bill-item" v-for="bill in sortedBills" :key="bill.id">
        <span class="bill-name" :style="{ color: bill.color }">{{
          bill.name
        }}</span>
        <span class="bill-days"
          >due in {{ bill.daysLeft }} days on {{ bill.due }}</span
        >
        <span class="last-payment">
          last:
          {{
            lastGroup?.payments.find((p) => p.card_name === bill.name)
              ?.amount_paid || "N/A"
          }}
        </span>
      </li>
    </ul>

    <payments-form @payment-saved="onSavedOrDeleted" />
    <payments-table @payment-deleted="onSavedOrDeleted" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase.js";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
import NextWeekModal from "./NextWeekModal.vue";
import PaymentsForm from "./PaymentsForm.vue";
import PaymentsTable from "./PaymentsTable.vue";
import { fetchAllPayments, paymentGroups } from "@/stores/paymentStore";

const bills = ref([]);
const lastGroup = computed(() => paymentGroups.value[0] || null);
const cardColors = ref({});
const showNextWeekModal = ref(false);
const nextWeekBills = ref([]);
const nextWeekExtraData = ref([]);

const formatDate = (date) => {
  return date ? dayjs(date).format("MM/DD/YYYY") : "N/A";
};

const fetchBills = async () => {
  const { data, error } = await supabase.from("bills").select("*");
  if (error) console.error("Error fetching bills:", error);
  else bills.value = data;
};

const daysUntilDue = (dueDay) => {
  const today = new Date();
  const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (due < today) due.setMonth(due.getMonth() + 1);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

const planNextWeek = async () => {
  const today = dayjs();
  const nextThursday =
    today.day() <= 4
      ? today.day(4) // this week’s Thursday, if today is Sun–Thu
      : today.day(4).add(1, "week"); // otherwise next week’s Thursday

  const windowStart = nextThursday.startOf("day");
  const windowEnd = nextThursday.add(8, "day").endOf("day");

  const { data: bills, error } = await supabase.from("bills").select("*");
  if (error) {
    console.error("Error fetching bills:", error);
    return;
  }

  nextWeekBills.value = (bills || [])
    .map((bill) => {
      let due = windowStart.set("date", bill.due_day_of_month);
      // if falls before Thu, roll over into next month
      if (due.isBefore(windowStart, "day")) {
        due = due.add(1, "month");
      }
      return { bill, due };
    })
    .filter(({ due }) => due.isBetween(windowStart, windowEnd, "day", "[]"))
    .map(({ bill, due }) => ({
      ...bill,
      dueDate: dayjs(due).format("MM/DD/YYYY"),
      daysFromThursday: due.diff(windowStart, "day"),
      daysLeft: due.diff(dayjs().startOf("day"), "day"),
    }));
  nextWeekExtraData.value = {
    thursdayDate: nextThursday.format("MM/DD/YYYY"),
  };

  showNextWeekModal.value = true;
};
const billsCollapsed = ref(true);
const toggleBillsVisibility = () => {
  billsCollapsed.value = !billsCollapsed.value;
};

const sortedBills = computed(() => {
  const today = dayjs().startOf("day");

  return bills.value
    .map((bill) => {
      let dueDate = dayjs().startOf("day").date(bill.due_day_of_month);

      // if that’s already before today, bump it into next month
      if (dueDate.isBefore(today, "day")) {
        dueDate = dueDate.add(1, "month");
      }

      return {
        ...bill,
        due: dueDate.format("MM/DD"),
        daysLeft: daysUntilDue(bill.due_day_of_month),
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
});

const labelFor = (name) => {
  const b = bills.value.find(
    (x) => x.name.toLowerCase() === name.toLowerCase()
  );
  return b?.label || name;
};

const totalPaid = computed(
  () =>
    lastGroup.value?.payments.reduce(
      (sum, p) => sum + Number(p.amount_paid),
      0
    ) || 0
);

const cardsPaid = computed(() => {
  if (!lastPayment.value || !bills.value.length) return [];

  return lastPayment.value.map((p) => {
    const match = bills.value.find(
      (b) => b.name?.toLowerCase() === p.card_name?.toLowerCase()
    );

    return {
      card: match?.label || p.card_name,
      amount: Number(p.amount_paid).toFixed(2),
      color: match?.color || "#333",
    };
  });
});

const leftover = computed(
  () => Number(lastGroup.value?.starting_balance || 0) - totalPaid.value
);
const onSavedOrDeleted = () => fetchAllPayments(supabase);

onMounted(async () => {
  fetchBills();
  await fetchAllPayments(supabase);
});
</script>

<style scoped lang="scss">
.dashboard {
  padding: 2rem;
  font-family: "Inter", sans-serif;

  h2 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .bill-list {
    list-style: none;
    padding: 0;

    .bill-item {
      display: grid;
      grid-template-columns: 30% 50% 30%;
      align-items: center; /* Vertically align items */
      background: var(--cards);
      margin-bottom: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.6rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        transform: translateY(-2px);
      }

      .bill-name {
        font-weight: 600;
        text-align: left;
      }

      .bill-days {
        font-style: italic;
        font-size: 0.95rem;
        color: #94a3b8; /* Muted light color */
        text-align: left;
      }

      .bill-due {
        text-align: left; 
      }
    }
  }
}
.last-paid {
  background: var(--cards);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  font-family: "Inter", sans-serif;

  h3 {
    margin: 0.75rem 0 0.75rem;
    font-size: 1.25rem;
    background: var(--color-blue);
    width: 75%;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  p {
    margin: 0.25rem;
    font-size: 0.95rem;

    strong {
      color: #f8fafc;
    }
  }
  li {
    margin: 0.25rem 0;
    font-size: 0.95rem;
    list-style-type: none;

    &:before {
      content: "•";
      color: var(--text-primary); /* Light text color */
      margin-right: 0.5rem;
    }
  }
}
.plan-btn {
  text-align: center;

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    color: var(--text-primary);
    background-color: var(--color-blue);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--shade-4);
    }
  }
}
</style>
