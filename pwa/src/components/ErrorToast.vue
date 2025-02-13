<template>
  <div class="fixed bottom-4 right-4 bg-error/10 text-error px-6 py-3 rounded-lg shadow-lg flex items-center border border-error/20">
    <span>{{ message }}</span>
    <button @click="$emit('close')" class="ml-4 hover:text-error/80">
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  message: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script> 