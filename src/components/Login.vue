<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { supabase } from '@/lib/supabase'
  
  const email = ref('')
  const password = ref('')
  const error = ref('')
  
  const login = async () => {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (authError) {
      error.value = authError.message
    } else {
        router.push('/') 
    }
  }
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2rem;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
  input {
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
  }
  button {
    padding: 0.75rem;
    width: 100%;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 0.5rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
  </style>
  