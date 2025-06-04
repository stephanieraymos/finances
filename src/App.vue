<template>
    <router-view v-if="ready" />
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '@/lib/supabase'
  
  const router = useRouter()
  const ready = ref(false)
  
  onMounted(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
  
    if (!session && router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  
    ready.value = true
  })
  </script>
  