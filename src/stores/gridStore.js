import { defineStore } from "pinia";
import { WebStorage } from "../use/LocalStorage";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

export const useGrid = defineStore("gridStore", {
  state: () => ({
    grid: {}, // AG-Grid API container, populate onGridReady
    isLoading: false,
    highlightedRows: {},
    columnDefs: null, // updated at runtime
    sortedNodes: [],
    defaultCol: {
      flex: 1,
      minWidth: 150,
      sortable: true,
      resizable: true,
      sortingOrder: ["asc", "desc", null],
    },
    defaultColState: {
      // True if the column is hidden
      hide: false,
      width: 200,
      flex: null,
      sort: null,
      sortIndex: null,
      aggFunc: null,
      pivot: null,
      pivotIndex: null,
      pinned: null,
      rowGroup: false,
      rowGroupIndex: null,
    },
  }),

  actions: {
    // Usage: Generate column names from set columns or default columns
    async setColumnDefs(columns) {
      this.isLoading = true;

      try {
        this.columnDefs = columns || this.defaultColumns;
      } catch (error) {
        console.error("Error setting column defs:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
