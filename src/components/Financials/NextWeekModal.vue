<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h3>Bills Due Next Week – {{ extraData.thursdayDate }}</h3>
        <button class="close-btn" @click="close">×</button>
      </header>
      <div class="modal-body">
        <table class="details-table">
          <thead>
            <tr>
              <th>Bill</th>
              <th class="amount-col">Days Left</th>
              <th class="amount-col">Due</th>
              <th class="amount-col tooltip-container">
                From Thurs
                <Tooltip v-if="showTooltip" :message="'Due x days after thursday'" />
                <span
                  class="tooltip-icon"
                  @click="showTooltip = !showTooltip"
                >?</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bill in bills" :key="bill.id">
              <td :style="{ color: bill.color }">
                {{ bill.name }}
              </td>
              <td class="amount-col">
                {{ bill.daysLeft }}
              </td>
              <td class="amount-col">
                {{ bill.dueDate }}
              </td>
              <td class="amount-col">
                {{ bill.daysFromThursday }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import Tooltip from '../ToolTip.vue'; // Import reusable Tooltip component

const showTooltip = ref(false);

defineProps(['bills', 'extraData']);
const emit = defineEmits(['close']);
const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: var(--cards);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--shade-4);
  border-bottom: 1px solid var(--shade-5);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--shade-7);
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
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--shade-5);
}

.details-table th {
  background: var(--cards);
  font-weight: 600;
}

.tooltip-container {
  position: relative;
}

.tooltip-icon {
  display: inline-block;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6c757d;
}

.tooltip-icon:hover {
  color: #343a40;
}
</style>
