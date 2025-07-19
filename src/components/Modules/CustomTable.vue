<template>
  <div class="custom-table">
    <input v-model="searchTerm" placeholder="Search..." class="search-input" />
    <table>
      <thead>
        <tr>
          <th
            v-for="col in allColumns"
            :key="col.field"
            @click="toggleSort(col.field)"
            class="sortable"
          >
            {{ col.headerName }}
            <span v-if="sort.field === col.field">
              {{ sort.direction === "asc" ? "▲" : "▼" }}
            </span>
          </th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(group, status) in groupedRows" :key="status">
          <tr class="group-header" @dragover.prevent @drop="onDrop(status)">
            <td :colspan="allColumns.length + 1">Status: {{ status }}</td>
          </tr>
          <tr
            v-for="row in group"
            :key="row.id"
            draggable="true"
            @dragstart="onDragStart(row)"
          >
            <td
              v-for="col in allColumns"
              :key="col.field"
              @dblclick="editCell(row.id, col.field)"
              @click="handleCellClick($event, row, col)"
              >
              <template
                v-if="
                  editingCell.id === row.id && editingCell.field === col.field
                "
              >
                <input
                  v-if="col.field !== 'status'"
                  v-model="row[col.field]"
                  @blur="saveEdit(row, col.field)"
                  @keyup.enter="saveEdit(row, col.field)"
                  autofocus
                  class="editable-input"
                />
                <select
                  v-else
                  v-model="row.status"
                  @blur="saveEdit(row, 'status')"
                  @change="saveEdit(row, 'status')"
                  class="editable-input"
                >
                  <option value="IP">IP</option>
                  <option value="Watched">Watched</option>
                  <option value="Backlog">Backlog</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </template>
              <template v-else>{{ row[col.field] }}</template>
            </td>
            <td>
              <button class="delete-btn" @click="deleteRow(row.id)">🗑️</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  rows: Array,
  columns: Array,
});
const emit = defineEmits(["update:rows", "delete-row"]);

const searchTerm = ref("");
const editingCell = ref({ id: null, field: null });
const sort = ref({ field: "", direction: "asc" });
const draggedRow = ref(null);

const allColumns = computed(() => props.columns);
const visibleColumns = computed(() =>
  props.columns.filter((col) => col.field !== "status")
);

const filteredRows = computed(() => {
  if (!searchTerm.value) return props.rows;
  return props.rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  );
});
let clickTimer = null;

function handleCellClick(event, row, col) {
  const tag = event.target.tagName.toLowerCase();
  const isInputLike = ["input", "select", "textarea"].includes(tag);

  if (isInputLike) return;

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    emit("row-click", row); // double-click
  } else {
    clickTimer = setTimeout(() => {
      editCell(row.id, col.field); // single click
      clickTimer = null;
    }, 200);
  }
}
const sortedRows = computed(() => {
  if (!sort.value.field) return filteredRows.value;
  return [...filteredRows.value].sort((a, b) => {
    const valA = a[sort.value.field];
    const valB = b[sort.value.field];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return sort.value.direction === "asc" ? -1 : 1;
    if (valA > valB) return sort.value.direction === "asc" ? 1 : -1;
    return 0;
  });
});

const groupedRows = computed(() => {
  return sortedRows.value.reduce((groups, row) => {
    const key = row.status || "Uncategorized";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
    return groups;
  }, {});
});

function toggleSort(field) {
  if (sort.value.field === field) {
    sort.value.direction = sort.value.direction === "asc" ? "desc" : "asc";
  } else {
    sort.value.field = field;
    sort.value.direction = "asc";
  }
}

function editCell(id, field) {
  editingCell.value = { id, field };
}

function saveEdit(row, field) {
  editingCell.value = { id: null, field: null };
  emit("update:rows", [...props.rows]);
}

function deleteRow(id) {
  emit("delete-row", id);
}

function onDragStart(row) {
  draggedRow.value = row;
}

function onDrop(newStatus) {
  if (!draggedRow.value || draggedRow.value.status === newStatus) return;
  draggedRow.value.status = newStatus;
  emit("update:rows", [...props.rows]);
  draggedRow.value = null;
}
</script>

<style scoped>
.search-input {
  margin-bottom: 0.5rem;
  padding: 0.4rem;
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--shade-5);
  background: var(--cards);
  color: var(--text-primary);
}
.custom-table {
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
  padding: 1rem;
}

table {
  width: auto;
  table-layout: auto;
  border-collapse: collapse;
  background: var(--cards);
}

th {
  background: var(--color-blue);
  font-weight: bold;
}
th,
td {
  border: 1px solid var(--shade-4);
  padding: 0.5rem;
  text-align: left;
  white-space: nowrap;
}
th.sortable {
  position: relative;
  cursor: col-resize;
  resize: horizontal;
  overflow: auto;
  min-width: 80px;
  max-width: 600px;
}
th.sortable::selection {
  background: transparent;
}
.group-header {
  background: var(--shade-4);
  font-weight: bold;
  color: var(--text-primary);
}
.editable-input {
  background: var(--cards);
  color: var(--text-primary);
  border: 1px solid var(--shade-4);
  width: 100%;
  padding: 0.3rem;
  box-sizing: border-box;
}
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-primary);
}
</style>
