<template>
  <div class="life-dash">
    <button @click="showModal = true" class="add-btn">Add New Item</button>
    <button @click="openNotStartedModal" class="not-started-btn">Not Started</button>

    <CustomDataTable
      :rows="rowData"
      :columns="columnDefs"
      @update:rows="updateRows"
      @delete-row="handleDelete"
      @row-click="openDetails"
    />

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
              <select v-model="newItem.status" required>
                <option value="IP">IP</option>
                <option value="Watched">Watched</option>
                <option value="Backlog">Backlog</option>
                <option value="Not Started">Not Started</option>
              </select>
            </label>
            <label>
              Platform:
              <input v-model="newItem.platforms" type="text" />
            </label>
            <label>
              Rating:
              <input v-model="newItem.rating" type="number" min="0" max="10" />
            </label>
            <label>
              Date Watched:
              <input v-model="newItem.date_watched" type="date" />
            </label>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Save</button>
              <button
                type="button"
                class="cancel-btn"
                @click="showModal = false"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
    <template v-if="selectedItem">
      <div class="modal-overlay" @click.self="closeDetails">
        <div class="modal detail-modal">
          <h2>Edit Item</h2>
          <form @submit.prevent="saveEditedItem">
            <label>
              Title:
              <input v-model="editableItem.title" type="text" required />
            </label>
            <label>
              Status:
              <select v-model="editableItem.status">
                <option value="IP">IP</option>
                <option value="Watched">Watched</option>
                <option value="Backlog">Backlog</option>
                <option value="Not Started">Not Started</option>
              </select>
            </label>
            <label>
              Platform:
              <input v-model="editableItem.platforms" type="text" />
            </label>
            <label>
              Rating:
              <input
                v-model="editableItem.rating"
                type="number"
                min="0"
                max="10"
              />
            </label>
            <label>
              Date Watched:
              <input v-model="editableItem.date_watched" type="date" />
            </label>
            <label>
              Note:
              <textarea v-model="editableItem.note" />
            </label>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="closeDetails">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
    <CustomModal
      v-if="showNotStartedModal"
      :header="'Not Started'"
      :body="notStartedMoviesBody"
      :buttons="notStartedModalButtons"
      :isVisible="showNotStartedModal"
      @close="closeNotStartedModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import CustomModal from "@/components/Modules/CustomModal.vue";
import CustomDataTable from "@/components/Modules/CustomTable.vue";

const rowData = ref([]);
const showModal = ref(false);
const showNotStartedModal = ref(false);

const newItem = ref({
  title: "",
  platforms: "",
  rating: null,
  date_watched: "",
  status: "Not Started",
});
const selectedItem = ref(null);
const editableItem = ref(null);

const openDetails = (row) => {
  selectedItem.value = row;
  editableItem.value = { ...row }; // shallow copy for editing
};

const closeDetails = () => {
  selectedItem.value = null;
  editableItem.value = null;
};

const saveEditedItem = async () => {
  const { error } = await supabase
    .from("watch_list")
    .update(editableItem.value)
    .eq("id", editableItem.value.id);

  if (error) {
    console.error("Error updating item:", error);
    return;
  }

  await fetchWatchList();
  closeDetails();
};

const columnDefs = [
  { field: "title", headerName: "Title" },
  { field: "platforms", headerName: "Platform" },
  { field: "rating", headerName: "Rating" },
  { field: "date_watched", headerName: "Date Watched" },
  { field: "status", headerName: "Status" },
];

const fetchWatchList = async () => {
  const { data, error } = await supabase.from("watch_list").select("*");
  if (error) {
    console.error("Error fetching watch list:", error);
    return;
  }
  rowData.value = data || [];
};

// Computed property to filter movies with status = "Not Started"
const notStartedMovies = computed(() =>
  rowData.value.filter((movie) => movie.status === "Not Started")
);

// Modal body content for "Not Started" movies
const notStartedMoviesBody = computed(() =>
  notStartedMovies.value
    .map((movie) => `<li>${movie.title} (${movie.platforms || "Unknown Platform"})</li>`)
    .join("")
);

// Modal buttons
const notStartedModalButtons = [
  {
    label: "Close",
    class: "close-btn",
    onClick: () => closeNotStartedModal(),
  },
];

// Open "Not Started" modal
const openNotStartedModal = () => {
  showNotStartedModal.value = true;
};

// Close "Not Started" modal
const closeNotStartedModal = () => {
  showNotStartedModal.value = false;
};

// Add a new item
const addItem = async () => {
  // Prepare cleaned item with default fallback
  const cleanedItem = {
    ...newItem.value,
    status: newItem.value.status || "Not Started",
  };

  // Remove blank strings and nulls (like empty date)
  Object.keys(cleanedItem).forEach((key) => {
    if (cleanedItem[key] === "" || cleanedItem[key] === null) {
      delete cleanedItem[key];
    }
  });

  const { error } = await supabase.from("watch_list").insert(cleanedItem);
  if (error) {
    console.error("Error adding new item:", error);
    return;
  }

  await fetchWatchList();

  // Reset form
  newItem.value = {
    title: "",
    platforms: "",
    rating: null,
    date_watched: "",
    status: "",
  };
  showModal.value = false;
};

const updateRows = async (updatedRows) => {
  for (const row of updatedRows) {
    const { error } = await supabase
      .from("watch_list")
      .update(row)
      .eq("id", row.id);
    if (error) console.error("Error updating row:", error);
  }
  rowData.value = [...updatedRows];
};

const handleDelete = async (id) => {
  const { error } = await supabase.from("watch_list").delete().eq("id", id);
  if (error) {
    console.error("Error deleting row:", error);
    return;
  }
  await fetchWatchList();
};

onMounted(fetchWatchList);
</script>

<style lang="scss">
.life-dash {
  max-width: 100%;
  margin: 0 auto;
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
  cursor: pointer;
  font-size: 1.2rem;
}
.add-btn {
  background-color: var(--color-blue);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.not-started-btn {
  background-color: var(--color-yellow);
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.status-row {
  background-color: var(--color-blue);
  font-weight: bold;
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
.modal select {
  padding: 0.5rem;
  border: 1px solid var(--shade-5);
  background: var(--cards);
  color: var(--text-primary);
  width: 100%;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}
.modal textarea {
  padding: 0.5rem;
  border: 1px solid var(--shade-5);
  background: var(--cards);
  color: var(--text-primary);
  width: 100%;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 0.75rem;
}
.save-btn {
  background-color: var(--color-blue);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-btn {
  background-color: var(--shade-2);
  border: 1px solid var(--shade-4);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;
}
.detail-modal {
  background-color: var(--cards);
  padding: 2rem;
  border-radius: 10px;
  width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.detail-modal h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.detail-row {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.detail-row strong {
  display: inline-block;
  width: 130px;
}
</style>
