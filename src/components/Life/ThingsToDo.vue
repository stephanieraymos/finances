<template>
  <div class="life-dash">
    <h1>Things To Do</h1>
    <button @click="showModal = true" class="add-btn">Add New Item</button>
    <div>
      <ag-grid-vue
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        class="grid ag-theme-alpine"
        :rowSelection="'single'"
        :row-height="30"
        :row-group-panel-show="'always'"
        :enable-range-selection="true"
        :suppress-multi-range-selection="true"
        :show-opened-group="true"
        :show-loading-overlay="true"
        :style="{ height: '70vh', width: '100%' }"
        @cellValueChanged="onCellValueChanged"
        @rowSelected="onRowSelected"
      ></ag-grid-vue>
    </div>

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
              <button type="submit" class="save-btn">Save</button>
              <button type="button" @click="showModal = false">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { supabase } from "@/lib/supabase";

const rowData = ref([]);
const columnDefs = ref([
  { field: "title", headerName: "Title", sortable: true, filter: true, editable: true },
  { field: "platforms", headerName: "Platform", sortable: true, filter: true, editable: true  },
  { field: "rating", headerName: "Rating", sortable: true, filter: "agNumberColumnFilter", editable: true  },
  { field: "date_watched", headerName: "Date Watched", sortable: true, filter: "agDateColumnFilter", editable: true  },
  { field: "status", headerName: "Status", sortable: true, filter: true, editable: true },
]);
const defaultColDef = ref({
  sortable: true,
  filter: true,
  resizable: true,
});

const showModal = ref(false);
const newItem = ref({
  title: "",
  platforms: "",
  rating: null,
  date_watched: "",
  status: "",
});

const fetchWatchList = async () => {
  const { data, error } = await supabase.from("watch_list").select("*");
  if (error) {
    console.error("Error fetching watch list:", error);
    return;
  }
  rowData.value = data || [];
  console.log("Fetched watch list:", rowData.value);
};

const addItem = async () => {
  const { error } = await supabase.from("watch_list").insert(newItem.value);
  if (error) {
    console.error("Error adding new item:", error);
    return;
  }
  await fetchWatchList();
  newItem.value = {
    title: "",
    platforms: "",
    rating: null,
    date_watched: "",
    status: "",
  };
  showModal.value = false;
};

const onCellValueChanged = async (event) => {
  const updatedItem = event.data;
  const { error } = await supabase
    .from("watch_list")
    .update(updatedItem)
    .eq("id", updatedItem.id);
  if (error) {
    console.error("Error updating item:", error);
  }
};

const onRowSelected = (event) => {
  console.log("Selected row:", event.data);
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
  color: white;
  border: none;
  padding: 0.5rem 1rem;
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
.save-btn {
  background-color: var(--color-blue);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
::v-deep(grid) {
  * {
    @include custom-scrollbar;
    &::-webkit-scrollbar {
      width: 0.45rem;
      height: 0.45rem;
    }
    &::-webkit-scrollbar-track {
      background: var(--shade-1);
      outline: 1px solid var(--shade-7);
    }

    &::-webkit-scrollbar-thumb {
      // background: var(--color-accent-highlight-text);
      // background: var(--shade-3);
    }
  }
}
.ag-theme-alpine {
    --ag-background-color: var(--cards);
    --ag-header-background-color: var(--shade-5);
    --ag-odd-row-background-color: var(--shade-2);
    --ag-border-color: var(--shade-4);
    --ag-header-cell-text-color: var(--text-primary);
    --ag-cell-text-color: var(--text-secondary);
    --ag-row-hover-color: var(--shade-3);
    --ag-selected-row-background-color: var(--shade-5);
    --ag-font-family: 'Inter', sans-serif;
    --ag-filter-body-wrapper: var(--cards);
  }
</style>