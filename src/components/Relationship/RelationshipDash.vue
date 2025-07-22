<template>
    <div class="relationship-dash">
      <h1>Relationship Dashboard</h1>
      <button @click="openModal">Add New</button>
  
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else>
        <div v-if="dates.length === 0" class="no-data">No dates found.</div>
        <ul v-else class="date-ideas-list">
          <li v-for="date in dates" :key="date.id" class="date-idea">
            <h3>{{ date.place }}</h3>
            <p>{{ date.note }}</p>
            <p><strong>Date:</strong> {{ date.date }}</p>
            <button @click="editDate(date)">Edit</button>
            <button @click="deleteDate(date.id)">Delete</button>
          </li>
        </ul>
      </div>
  
      <!-- Inline Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2>Add New Date</h2>
          <form @submit.prevent="submitNewDate">
            <label>
              Place:
              <input v-model="newDate.place" type="text" required />
            </label>
            <label>
              Note:
              <textarea v-model="newDate.note"></textarea>
            </label>
            <label>
              Date:
              <input v-model="newDate.date" type="date" />
            </label>
            <div class="modal-actions">
              <button type="submit">Save</button>
              <button type="button" @click="closeModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { supabase } from '@/lib/supabase';
  
  const dates = ref([]);
  const loading = ref(true);
  const showModal = ref(false);
const newDate = ref({ place: '', note: '', date: null });
  
  const fetchDateIdeas = async () => {
    loading.value = true;
    const { data, error } = await supabase.from("relationship_dates").select("*");
    if (error) {
      console.error("Error fetching dates list:", error);
    } else {
      dates.value = data || [];
    }
    loading.value = false;
  };
  
  const openModal = () => {
      newDate.value = { place: '', note: '', date: null };
      showModal.value = true;
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  
  const submitNewDate = async () => {
    const { data, error } = await supabase
      .from("relationship_dates")
      .insert([newDate.value])
      .select();
  
    if (error) {
      console.error("Error adding new date:", error);
      return;
    }
    if (data && data.length > 0) {
      dates.value.push(data[0]);
    }
    closeModal();
  };
  
  const editDate = (date) => {
    console.log("Edit date:", date);
    // Future: open modal pre-filled with date data
  };
  
  const deleteDate = async (id) => {
    const { error } = await supabase.from("relationship_dates").delete().eq("id", id);
    if (error) {
      console.error("Error deleting date:", error);
      return;
    }
    dates.value = dates.value.filter(date => date.id !== id);
  };
  
  onMounted(fetchDateIdeas);
  </script>
  
  <style scoped>
  .relationship-dash {
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .loading, .no-data {
    font-size: 16px;
    color: #777;
  }
  .date-ideas-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .date-idea {
    background: var(--cards);
    margin: 10px 0;
    border: 1px solid var(--shade-4);
    border-radius: 5px;
    padding: 10px;
  }
  .date-idea h3 {
    margin: 0;
  }
  button {
    background-color: var(--color-blue);
    color: white;
    border: none;
    padding: 8px 12px;
    margin-right: 5px;
    margin-top: 5px;
    border-radius: 5px;
    cursor: pointer;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    background: var(--cards);
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
  }
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }
  .modal input,
  .modal textarea {
    background: var(--cards);
    border: var(--shade-6);
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    margin-bottom: 12px;
  }
  </style>
  