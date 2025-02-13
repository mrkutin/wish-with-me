<template>
  <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
    <span>{{ message }}</span>
    <button @click="$emit('close')" class="ml-4 hover:text-green-200">
      <XIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { onMounted } from 'vue'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

onMounted(() => {
  setTimeout(() => {
    emit('close')
  }, 5000)
})
</script> 