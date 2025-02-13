<template>
  <div class="fixed bottom-4 right-4 bg-white text-text-primary px-6 py-3 rounded-lg shadow-lg flex items-center border border-border">
    <span>{{ message }}</span>
    <div v-if="action" class="ml-4">
      <button
        @click="action.onClick"
        class="text-primary hover:text-primary-dark font-medium"
      >
        {{ action.label }}
      </button>
    </div>
    <button @click="$emit('close')" class="ml-4 text-text-secondary hover:text-text-primary">
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

onMounted(() => {
  if (props.duration) {
    setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})
</script> 