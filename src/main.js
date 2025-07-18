import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/styles/ag-grid-custom.scss";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register the required modules globally
ModuleRegistry.registerModules([
  AllCommunityModule, // Includes all community features
]);

import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme CSS
// import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS

const app = createApp(App);
app.use(router);
app.mount("#app");
