<template>
    <div class="tooltip" :style="{ top: position.top, left: position.left }">
      {{ message }}
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const props = defineProps({
    message: String,
  });
  
  const position = ref({ top: '0px', left: '0px' });
  
  onMounted(() => {
    const tooltipElement = document.querySelector('.tooltip');
    const parentElement = tooltipElement?.parentElement;
    console.log('Tooltip mounted:', tooltipElement, parentElement);
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      position.value = {
        top: `${rect.top - 20}px`,
        left: `${rect.left + rect.width / 3}px`,
      };
    }
  });
  </script>
  
  <style scoped>
  .tooltip {
    position: fixed;
    background: var(--shade-3);
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* Dark shadow */
    z-index: 1000;
  }
  </style>