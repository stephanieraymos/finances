<template>
  <div class="sold-list">
    <h2>Sold Item(s)</h2>

    <div v-if="sales.length === 0" class="empty">No items sold yet.</div>

    <ul>
      <li
        v-for="sale in sales"
        :key="sale.id"
        :id="`sale-${sale.id}`"
        :class="{ highlight: sale.id === highlightId }"
      >
        <div v-if="sale.safe_transaction_id" class="link">
          <button @click="goToSafe(sale.safe_transaction_id)">
            💰 View in Safe Records
          </button>
        </div>
        <div class="top-line">
          <strong>{{ sale.title }}</strong>
        </div>
        <div class="details">
          <span v-if="sale.amount_posted"
            >Listed: ${{ sale.amount_posted }}</span
          >
          <span v-if="sale.amount_purchased">
            / Bought: ${{ sale.amount_purchased }}</span
          >
          <span v-if="sale.sold_price"
            >Sold: <span class="amount">${{ sale.sold_price }}</span>
          </span>
          <span v-if="sale.tag" class="tag">[{{ sale.tag }}]</span>
        </div>
        <div v-if="sale.note" class="note">📝 {{ sale.note }}</div>
        <div v-if="sale.image_url" class="thumb">
          <img :src="sale.image_url" alt="sale image" />
        </div>
        <small
          >Sold on {{ formatDate(sale.date_sold || sale.created_at) }}</small
        >
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

const router = useRouter();

const sales = ref([]);
const route = useRoute();
const highlightId = route.query.highlightId;
const fetchSales = async () => {
  const { data } = await supabase
    .from("sales_items")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (data) sales.value = data;
};
const goToSafe = (id) => {
  router.push({ name: 'MoneyDash', query: { highlightId: id } });
};
const formatDate = (d) => new Date(d).toLocaleDateString();
onMounted(async () => {
  await fetchSales();
  if (highlightId) {
    setTimeout(() => {
      const rowEl = document.getElementById(`sale-${highlightId}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
        rowEl.classList.add("highlight");
      }
    }, 300);
  }
});
</script>
<style scoped lang="scss">
.sold-list {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: "Inter", sans-serif;
}
h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.empty {
  text-align: center;
  color: #999;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  padding-left: 0.5rem;
}
.top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.amount {
  font-weight: bold;
  color: #0b8457;
}
.details {
  font-size: 0.9rem;
  color: #555;
}
.tag {
  margin-left: 0.5rem;
  color: #888;
}
.note {
  font-style: italic;
  margin-top: 0.25rem;
}
.thumb img {
  max-width: 100px;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
}
.link a {
  font-size: small;
  color: var(--color-blue);
  background: var(--cards);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-decoration: none;

  &:hover {
    background: var(--color-blue);
    color: white;
  }
}
.highlight {
  background: #fff8c4;
  border-left: 5px solid #f4d03f;
  padding-left: 0.5rem;
}
</style>
