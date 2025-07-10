<template>
  <div class="life-dash">
    <h1>Things To Do</h1>
    <div v-if="Object.keys(watchList).length">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Platform</th>
            <th>Rating</th>
            <th>Date Watched</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <!-- Iterate over each status group -->
          <template v-for="(items, status) in watchList" :key="status">
            <!-- Render a row for the status group -->
            <tr class="status-row">
              <td colspan="6">
                <strong>{{ status }}</strong>
              </td>
            </tr>
            <!-- Render rows for each item in the group -->
            <tr v-for="item in items" :key="item.id">
              <td>
                <input
                  v-model="item.title"
                  @blur="saveItem(item)"
                  @keyup.enter="saveItem(item)"
                  type="text"
                  class="editable-field"
                />
              </td>
              <td>
                <input
                  v-model="item.platforms"
                  @blur="saveItem(item)"
                  @keyup.enter="saveItem(item)"
                  type="text"
                  class="editable-field"
                />
              </td>
              <td>
                <input
                  v-model="item.rating"
                  @blur="saveItem(item)"
                  @keyup.enter="saveItem(item)"
                  type="number"
                  class="editable-field rating-field"
                />
              </td>
              <td>
                <input
                  v-model="item.date_watched"
                  @blur="saveItem(item)"
                  @keyup.enter="saveItem(item)"
                  type="date"
                  class="editable-field"
                />
              </td>
              <td>
                <input
                  v-model="item.status"
                  @blur="saveItem(item)"
                  @keyup.enter="saveItem(item)"
                  type="text"
                  class="editable-field status-field"
                />
              </td>
              <td>
                <button class="delete-btn" @click="deleteItem(item.id)">
                  🗑️
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <button @click="showModal = true" class="add-btn">Add New Item</button>

      <template v-if="showModal">
        <div class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <h2>Add New Item</h2>
            <form @submit.prevent="addItem">
              <label>
                Title:
                <input v-model="newItem.title" type="text" required />
              </label>
              <label>
                Status:
                <input v-model="newItem.status" type="text" required />
              </label>
              <label>
                Platform:
                <input v-model="newItem.platforms" type="text" />
              </label>
              <label>
                Rating:
                <input
                  v-model="newItem.rating"
                  type="number"
                  min="0"
                  max="10"
                />
              </label>
              <label>
                Date Watched:
                <input v-model="newItem.date_watched" type="date" />
              </label>
              <div class="modal-actions">
                <button
                  type="submit"
                  class="save-btn"
                  @click="saveNewWatchListItem()"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
    <div v-else>
      <p>No items found in your watch list.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase.js";

const watchList = ref({});
const platforms = ref([]);
const showModal = ref(false);
const newItem = ref({
  title: "",
  platforms: "",
  rating: null,
  date_watched: "",
  status: "",
});

onMounted(async () => {
  const { data, error } = await supabase.from("watch_list").select("*");

  if (error) {
    console.error("Error fetching watch list:", error);
    return;
  }

  if (data && data.length > 0) {
    const grouped = data.reduce((acc, item) => {
      if (item.status) {
        (acc[item.status] = acc[item.status] || []).push(item);
      }
      return acc;
    }, {});
    watchList.value = grouped;
  } else {
    console.warn("No data found in the watch list.");
    watchList.value = {};
  }

  const { data: platformData, error: platformError } = await supabase
    .from("watch_list")
    .select("platforms");

  if (platformError) {
    console.error("Error fetching platforms:", platformError);
  } else {
    platforms.value = platformData.map((p) => p.name);
  }
});
async function fetchWatchList() {
  const { data, error } = await supabase.from("watch_list").select("*");

  if (error) {
    console.error("Error fetching watch list:", error);
    return;
  }

  if (data && data.length > 0) {
    const grouped = data.reduce((acc, item) => {
      if (item.status) {
        (acc[item.status] = acc[item.status] || []).push(item);
      }
      return acc;
    }, {});
    watchList.value = grouped;
  } else {
    console.warn("No data found in the watch list.");
    watchList.value = {};
  }
}
async function saveItem(item) {
  const { id, ...updatedData } = item;
  console.log("Saving item:", updatedData);

  const { error } = await supabase
    .from("watch_list")
    .update(updatedData)
    .eq("id", id);

  if (error) {
    console.error("Error saving item:", error);
  }
}

async function deleteItem(id) {
  const { error } = await supabase.from("watch_list").delete().eq("id", id);

  if (error) {
    console.error("Error deleting item:", error);
    return;
  }

  // Remove the item from the local watchList
  for (const status in watchList.value) {
    watchList.value[status] = watchList.value[status].filter(
      (item) => item.id !== id
    );
  }
}

async function saveNewWatchListItem() {
  if (!newItem.value.title || !newItem.value.status) {
    console.error("Title and Status are required fields.");
    return;
  }

  const { data, error } = await supabase
    .from("watch_list")
    .insert(newItem.value);

  if (error) {
    console.error("Error adding new item:", error);
    return;
  }

  if (data && data.length > 0) {
    const item = data[0];
    if (!watchList.value[item.status]) {
      watchList.value[item.status] = [];
    }
    watchList.value[item.status].push(item);
  }

  // Reset the newItem form and close the modal
  newItem.value = {
    title: "",
    platforms: "",
    rating: null,
    date_watched: "",
    status: "",
  };
  showModal.value = false;

  await fetchWatchList();
}
</script>

<style scoped>
.life-dash {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  overflow-x: auto;
}

.watch-list-group {
  margin-bottom: 2rem;
}

.watch-list-group h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.delete-btn {
  background-color: transparent;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1.2rem;
}
.add-btn {
  background-color: var(--color-blue);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
table tr:nth-child(even):not(.status-row) {
    background-color: var(--shade-1);
}
table {
  width: 100%;
  table-layout: auto; /* Allow columns to adjust width based on content */
}
table th {
  background: var(--cards);
  font-weight: 600;
}
th {
  text-align: left;
  padding: 0.25rem;
}

td {
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  padding: 0.25rem;
}
.status-row {
  background-color: var(--color-blue);
  font-weight: bold;
}
.editable-field {
  border: none;
  background-color: transparent;
  outline: none;
  transition: border-color 0.2s;
  width: auto; /* Let the input size adjust to its content */
  min-width: 0; /* Ensure the input doesn't shrink below its content size */
}

.editable-field:focus {
  border-bottom: 1px solid var(--color-blue);
}
.rating-field {
  width: 40px; 
}
.status-field {
  width: 75px; 
}
.title-field {
    width: 100px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background-color: var(--cards);
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.modal h2 {
  margin-bottom: 1rem;
}
.modal form {
  display: flex;
  flex-direction: column;
}
.modal label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  text-align: left;
}
.modal input {
  padding: 0.5rem;
  border: 1px solid var(--shade-5);
  background: var(--cards);
  width: 100%;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}
.save-btn {
  background-color: var(--color-blue);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
