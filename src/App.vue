<template>
    <router-view />
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/lib/supabase'
    import Dashboard from '@/components/Dashboard.vue'
  
  
  const router = useRouter()
  
  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  })
  </script>
  