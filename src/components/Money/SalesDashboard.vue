<template>
  <div class="sales-dashboard">
    <h2>Items Sold</h2>
    <div v-for="item in sales" :key="item.id" class="sale-item">
      <h3>{{ item.title }}</h3>
      <img
        v-if="item.image_url"
        :src="item.image_url"
        alt="Sold Item"
        style="max-width: 200px"
      />
      <p><strong>Sold For:</strong> ${{ item.amount_sold }}</p>
      <p v-if="item.amount_posted">
        <strong>Listed For:</strong> ${{ item.amount_posted }}
      </p>
      <p v-if="item.amount_purchased">
        <strong>Purchased For:</strong> ${{ item.amount_purchased }}
      </p>
      <p v-if="item.note">{{ item.note }}</p>
      <button
        v-if="item.safe_transaction_id"
        @click="viewInSafeRecords(item.safe_transaction_id)"
      >
        💰 View in Safe Records
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const highlightId = route.query.highlightId || null;
const sales = ref([]);

const fetchSales = async () => {
  const { data, error } = await supabase.from("sales_items").select("*");
  if (error) console.error("❌ Error fetching sales:", error);
  else sales.value = data;
};

const viewInSafeRecords = (transactionId) => {
  if (transactionId) {
    router.push({ name: "MoneyDash", query: { highlightId: transactionId } });
  }
};

onMounted(fetchSales);
</script>

<style scoped>
.sales-dashboard {
  padding: 1rem;
}
.sale-item {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>
