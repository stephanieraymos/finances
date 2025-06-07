<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>Payments on {{ formattedDate }}</h3>
        <button class="close-btn" @click="close">×</button>
      </header>
      <div class="modal-body">
        <table class="details-table">
          <thead>
            <tr>
              <th>Card</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in group.entries" :key="p.id">
              <td :style="{ color: colorFor(p.card_name) }">
                {{ labelFor(p.card_name) }}
              </td>
              <td class="amount-col">
                ${{ Number(p.amount_paid).toFixed(2) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th class="amount-col">${{ total.toFixed(2) }}</th>
            </tr>
            <tr>
              <th>Starting Balance</th>
              <th class="diff-col">${{ Number(group.c_start).toFixed(2) }}</th>
            </tr>
            <tr></tr>
            <th>Leftover</th>
            <th class="diff-col">
              ${{ (Number(group.c_start) - total).toFixed(2) }}
            </th>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  bills: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["close"]);

// Format date for header
const formattedDate = computed(() => {
  const [year, month, day] = props.group.date.split("-");
  return `${month}/${day}/${year}`;
});

// Compute total
const total = computed(() =>
  props.group.entries.reduce((sum, p) => sum + Number(p.amount_paid), 0)
);

// Helpers to match your store
const labelFor = (name) => {
  const b = props.bills.find((b) => b.name === name);
  return b?.label || name;
};
const colorFor = (name) => {
  const b = props.bills.find((b) => b.name === name);
  return b?.color || "#333";
};

function close() {
  emit("close");
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-blue);
  color: white;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: white;
  cursor: pointer;
}
.modal-body {
  padding: 1rem;
}
.details-table {
  width: 100%;
  border-collapse: collapse;
}
.details-table th,
.details-table td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.amount-col {
  text-align: right;
}
.diff-col {
  color: var(--color-red);
  text-align: right;
}
.details-table tfoot th {
  border-top: 2px solid #333;
}
</style>
