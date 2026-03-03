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
              <th>${{ Number(group.c_start).toFixed(2) }}</th>
            </tr>
            <tr>
              <th>Leftover</th>
              <th class="diff-col">
                ${{ (Number(group.c_start) - total).toFixed(2) }}
              </th>
            </tr>
          </tfoot>
        </table>
        <div class="note-section">
          <h3>Note:</h3>
          <div v-if="!isEditing" class="note-display" @click="startEdit">
            {{ noteText || "Click to add a note..." }}
          </div>
          <div v-else class="note-edit">
            <textarea v-model="noteText" rows="4"></textarea>
            <div class="note-buttons">
              <button @click="saveNote" class="save-btn">Save</button>
              <button @click="cancelEdit" class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { fetchAllPayments } from "@/stores/paymentStore";
import dayjs from "dayjs";
const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  bills: Array,
});
const emit = defineEmits(["close"]);

// Editing state
const isEditing = ref(false);
const noteText = ref(props.group.note || "");

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
function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  noteText.value = props.group.note || "";
  isEditing.value = false;
}

async function saveNote() {
  const { error } = await supabase
    .from("payment_groups")
    .update({ note: noteText.value })
    .eq("date", props.group.date);

  if (error) {
    console.error("Error saving note:", error.message);
  } else {
    // Refresh store
    await fetchAllPayments(supabase);
    isEditing.value = false;
  }
}
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: var(--cards);;
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
.note-section {
  padding: 0 0.5rem 0.5rem 0.5rem;
  h3 {
    color: var(--color-blue);
  }
}
.note-edit {
  display: flex;
  flex-direction: column;
  textarea {
    background: var(--shade-3);
    width: 95%;
    padding: 0.5rem;
    border-radius: 0.25rem;
    resize: vertical;
  }
}
.note-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
  button {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    &.save-btn {
      background: var(--color-blue);
      color: white;
    }
    &.cancel-btn {
      color: #333;
    }
  }
}
.note-display {
  white-space: pre-wrap;
  padding: 0.5rem;
}
.note-display:hover {
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.note-edit textarea {
  width: auto;
  margin-bottom: 0.5rem;
}
.note-section .note-display {
  white-space: pre-wrap;
}
</style>
