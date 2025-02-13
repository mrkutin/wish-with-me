<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main class="flex-1">
      <router-view v-if="!auth.loading"></router-view>
      <LoadingSpinner v-else />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from './components/TheNavbar.vue'
import TheFooter from './components/TheFooter.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style>
/* Remove any default margins/paddings */
body {
  margin: 0;
  padding: 0;
}
</style> 