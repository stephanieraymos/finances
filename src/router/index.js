import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/components/Dashboard.vue";
import Login from "@/components/Login.vue";
import MoneyDash from "@/components/Money/MoneyDash.vue";
import Sold from "@/components/Money/Sold.vue";
import SalesDashboard from "@/components/Money/SalesDashboard.vue";
import RelationshipDash from "@/components/Relationship/RelationshipDash.vue";

const routes = [
  {
    path: '/',
    redirect: '/dashboard/financials'
  },
  {
    path: "/dashboard",
    component: Dashboard,
    children: [
      { path: "", redirect: "/dashboard/financials" },
      {
        path: "financials",
        name: "FinancialsDash",
        component: () => import("@/components/Financials/FinancialsDash.vue"),
      },
      {
        path: "money",
        name: "MoneyDash",
        component: () => import("@/components/Money/MoneyDash.vue"),
      },
      {
        path: "life",
        name: "LifeDash",
        component: () => import("@/components/Life/LifeDash.vue"),
      },
      {
        path: "relationship",
        name: "RelationshipDash",
        component: () => import("@/components/Relationship/RelationshipDash.vue"),
      },
    ],
  },
  { path: "/login", name: "Login", component: Login },
  {
    path: "/sold",
    name: "Sold",
    component: Sold,
  },
  {
    path: "/sales-dashboard",
    name: "SalesDashboard",
    component: SalesDashboard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
