<template>
  <LoadingSpinner />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

onMounted(async () => {
  const token = route.query.token as string
  const encodedUser = route.query.user as string
  const returnUrl = localStorage.getItem('loginReturnUrl')
  localStorage.removeItem('loginReturnUrl')

  console.log('Callback received:', {
    token,
    encodedUser,
    returnUrl,
    allQueries: route.query
  })

  if (token && encodedUser) {
    try {
      const user = JSON.parse(decodeURIComponent(encodedUser))
      await auth.login(token, user)
      
      if (returnUrl) {
        router.replace(returnUrl)
      } else {
        router.replace('/wishlists')
      }
    } catch (err) {
      router.replace('/login')
    }
  } else {
    router.replace('/login')
  }
})
</script> 