<template>
  <div class="payments-table">
    <div v-if="isLoading">Loading...</div>
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
    <div v-if="activeTab === 'All'" class="filter-controls">
      <label>
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
        {{ allSelected ? "Unselect All" : "Select All" }}
      </label>
      <div class="card-filters">
        <label
          v-for="card in bills"
          :key="card.name"
          class="checkbox-label"
          :style="{ '--check-color': colorFor(card.name) }"
        >
          <input
            type="checkbox"
            :value="card.name"
            v-model="selectedCards"
            class="custom-checkbox"
          />
          <span class="checkmark"></span>
          <span class="card-name">{{ labelFor(card.name) }}</span>
        </label>
      </div>
    </div>

    <div v-if="filteredPayments.length === 0" class="no-payments">
      No payments found.
    </div>
    <div v-else-if="activeTab === 'Grouped'">
      <div
        v-for="group in groupedPayments"
        :key="group.date"
        class="group-block"
        @click="displayPaymentDetails(group)"
      >
        <h4>{{ formatDate(group.date) }}</h4>
        <p class="note" v-if="group.note">{{ group.note }}</p>
        <ul>
          <li v-for="p in group.entries" :key="p.id">
            <span :style="{ color: colorFor(p.card_name) }">
              {{ labelFor(p.card_name) }}</span
            >
            : ${{ p.amount_paid.toFixed(2) }}
          </li>
        </ul>
      </div>
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
          <td :style="{ color: colorFor(p.card_name) }">
            {{ labelFor(p.card_name) }}
          </td>
          <td>${{ Number(p.amount_paid).toFixed(2) }}</td>
          <td>
            <button class="delete" @click="deletePayment(p.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <PaymentDetailsModal
      v-if="showModal"
      :group="selectedGroup"
      :bills="bills"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import {
  payments,
  paymentGroups,
  fetchAllPayments,
} from "@/stores/paymentStore";
import { bills, fetchBills } from "@/stores/billStore";
import dayjs from "dayjs";
import PaymentDetailsModal from "@/components/PaymentDetailsModal.vue";

const showModal = ref(false);
const selectedGroup = ref(null);
const activeTab = ref("Last Payment");
const selectedCards = ref([]);
const allCardNames = computed(() => bills.value.map((b) => b.name));
const allSelected = computed(
  () => selectedCards.value.length === allCardNames.value.length
);
const isLoading = computed(() => !bills.value.length || !payments.value.length);
console.log('bills', bills);
const toggleAll = () => {
  selectedCards.value = allSelected.value ? [] : [...allCardNames.value];
};

const tabs = ["Last Payment", "Grouped", "Last Week", "This Month", "All"];

onMounted(() => {
  fetchAllPayments(supabase);
  fetchBills().then(() => {
    selectedCards.value = bills.value.map((b) => b.name); // select all initially
  });
});

const labelFor = (name) => {
  const match = bills.value.find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  );
  return match?.label || name;
};

const colorFor = (name) => {
  const match = bills.value.find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  );
  return match?.color || "#333";
};

const billsByName = computed(() => {
  const map = {};
  for (const bill of bills.value) {
    map[bill.name] = bill;
  }
  return map;
});

const formatDate = (d) => {
  if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Prevent timezone shift for raw YYYY-MM-DD strings
    const [year, month, day] = d.split("-");
    return `${month}/${day}/${year}`;
  }
  return new Date(d).toLocaleDateString();
};

const emit = defineEmits(["payment-deleted"]);

const deletePayment = async (id) => {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    console.error("❌ Delete failed:", error.message);
  } else {
    await fetchAllPayments(supabase); // refresh list
    emit("payment-deleted"); // Notify parent
  }
};

const displayPaymentDetails = (group) => {
  selectedGroup.value = group;
  showModal.value = true;
};

const filteredPayments = computed(() => {
  const today = dayjs();
  switch (activeTab.value) {
    case "Last Payment":
      const latestDate = payments.value[0]?.date;
      return payments.value.filter((p) => p.date === latestDate);
    case "Last Week":
      const lastWeek = today.subtract(7, "day");
      return payments.value.filter((p) => dayjs(p.date).isAfter(lastWeek));
    case "This Month":
      return payments.value.filter((p) => {
        const d = dayjs(p.date);
        return d.month() === today.month() && d.year() === today.year();
      });
    case "All":
      return payments.value.filter((p) =>
        selectedCards.value.includes(p.card_name)
      );

    default:
      return payments.value;
  }
});

const groupedPayments = computed(() => {
  return paymentGroups.value.map((g) => ({
    date: g.date,
    entries: g.payments,
    c_start: g.starting_balance,
    note: g.note,
  }));
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
        background-color: var(--color-blue);
        color: white;
      }
      &:hover {
        background-color: #d1d5e0;
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
    color: var(--color-red);
    transition: color 0.2s;

    &:hover {
      color: var(--color-red);
    }
  }
  .group-block {
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    background: #f9f9f9;
    border-radius: 0.5rem;

    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: #f1f4f8;
      cursor: pointer;
    }
    h4 {
      margin: 0 0 0.5rem;
      color: #333;
    }

    ul {
      list-style-type: none;
      padding-left: 0;

      li {
        margin-bottom: 0.25rem;
        color: #555;

        span {
          font-weight: bold;
        }
      }
    }
  }
  .card-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .checkbox-label {
    position: relative;
    padding-left: 24px;
    cursor: pointer;
    user-select: none;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    color: #333;

    .custom-checkbox {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .checkmark {
      position: absolute;
      left: 0;
      top: 2px;
      height: 16px;
      width: 16px;
      background-color: var(--color-text-primary);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      border: 1px solid #ccc;
    }

    .custom-checkbox:checked ~ .checkmark {
      background-color: var(--check-color);
      border-color: var(--check-color);
    }

    .custom-checkbox:checked ~ .checkmark::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .card-name {
      margin-left: 6px;
    }
  }
}
</style>
