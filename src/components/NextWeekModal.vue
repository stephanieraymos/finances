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
                <th class="amount-col">From Thurs</th>
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
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    bills: {
      type: Array,
      default: () => []
    },
    extraData: {
      type: Object,
      default: () => ({ thursdayDate: '' })
    }
  })
  
  const emit = defineEmits(['close'])
  function close() {
    emit('close')
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
  </style>
  