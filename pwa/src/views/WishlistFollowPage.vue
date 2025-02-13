<template>
  <LoadingSpinner v-if="loading" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    if (!auth.user) {
      throw new Error('Not authenticated')
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.token}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetUserId: auth.user.id
      })
    })

    if (!res.ok) {
      throw new Error('Failed to follow wishlist')
    }

    await res.json()
    router.replace('/wishlists')
  } catch (error) {
    router.replace('/wishlists')
  } finally {
    loading.value = false
  }
})
</script> 