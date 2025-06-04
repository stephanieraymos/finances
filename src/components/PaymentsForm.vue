<template>
    <div class="payment-form">
      <h2>Weekly Payments</h2>
      <form @submit.prevent="submitPayments">
        <div class="form-group">
          <label for="date">Date:</label>
          <input id="date" type="date" v-model="form.date" />
        </div>
  
        <div class="form-group">
          <label for="c_start">Starting Checking Balance:</label>
          <input id="c_start" type="number" v-model.number="form.c_start" />
        </div>
  
        <div
          class="form-group"
          v-for="card in cards"
          :key="card.key"
        >
          <label :for="card.key">{{ card.label }}:</label>
          <input :id="card.key" type="number" v-model.number="form[card.key]" />
        </div>
  
        <button type="submit">💾 Save</button>
      </form>
  
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  

  <script setup>
  import { reactive, ref } from "vue";
  import { supabase } from "@/lib/supabase";
  
  const cards = [
    { key: "amz", label: "Amazon" },
    { key: "pp", label: "PayPal" },
    { key: "ven", label: "Venmo" },
    { key: "wf_ac", label: "WF Active Cash" },
    { key: "disc", label: "Discover" },
    { key: "apple", label: "Apple" },
    { key: "attune", label: "WF Attune" },
    { key: "car", label: "Car" },
    { key: "lovesac", label: "Lovesac" },
    { key: "jc", label: "Joint Checking" }
  ];
  
  const today = new Date().toISOString().slice(0, 10);
  
  const form = reactive({
    date: today,
    c_start: 0,
    amz: 0,
    pp: 0,
    ven: 0,
    wf_ac: 0,
    disc: 0,
    apple: 0,
    attune: 0,
    car: 0,
    lovesac: 0,
    jc: 0
  });
  
  const message = ref("");
  
  const submitPayments = async () => {
    const toInsert = cards
      .filter(card => form[card.key] > 0)
      .map(card => ({
        date: form.date,
        card_name: card.key,
        amount_paid: form[card.key]
      }));
  
    if (toInsert.length === 0) {
      message.value = "⚠️ No amounts entered.";
      return;
    }
  
    const { error } = await supabase.from("payments").insert(toInsert);
  
    if (error) {
      message.value = "❌ Failed to save: " + error.message;
    } else {
      message.value = "✅ Payments saved!";
    }
  };
  </script>
  
<style scoped lang="scss">
.payment-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;

  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .form-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;

      label {
        flex: 2;
        font-weight: 500;
        color: #444;
      }

      input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        font-size: 1rem;
        text-align: right;

        &:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
      }
    }

    button {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #4a90e2;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;

      &:hover {
        background: #3a78c2;
      }
    }
  }

  .message {
    margin-top: 1rem;
    text-align: center;
    font-weight: 500;
    color: #333;
  }
}
</style>
