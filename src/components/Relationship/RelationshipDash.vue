<template>
    <div class="relationship-dash">
        <h1>Relationship Dashboard</h1>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
            <div v-if="dates.length === 0" class="no-data">
                No dates found.
            </div>
            <ul v-else class="date-ideas-list">
                <li v-for="date in dates" :key="date.id" class="date-idea">
                    <h3>{{ date.title }}</h3>
                    <p>{{ date.description }}</p>
                    <p><strong>Date:</strong> {{ date.date }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const dates = ref([]);
const loading = ref(true);

const fetchDateIdeas = async () => {
    loading.value = true;
    const { data, error } = await supabase.from("relationship_dates").select("*");
    if (error) {
        console.error("Error fetching dates list:", error);
        loading.value = false;
        return;
    }
    dates.value = data || [];
    loading.value = false;
};

onMounted(() => {
    fetchDateIdeas();
});
</script>

<style scoped>
.relationship-dash {
    padding: 20px;
    font-family: Arial, sans-serif;
}

.loading {
    font-size: 18px;
    color: #555;
}

.no-data {
    font-size: 16px;
    color: #888;
}

.date-ideas-list {
    list-style: none;
    padding: 0;
}

.date-idea {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
}

.date-idea h3 {
    margin: 0 0 5px;
}

.date-idea p {
    margin: 5px 0;
}
</style>