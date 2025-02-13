<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-900">{{ t.modals.createWishlist.title }}</h2>
        <button
          @click="onClose"
          class="text-gray-400 hover:text-gray-500 transition-colors p-1 hover:bg-gray-50 rounded-full"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div v-if="error" class="p-3.5 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {{ error }}
        </div>

        <!-- Name Field -->
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">
            {{ t.modals.createWishlist.name.label }}
            <span class="text-error ml-0.5">*</span>
          </label>
          <input
            ref="nameInput"
            type="text"
            id="name"
            v-model="name"
            required
            :placeholder="t.modals.createWishlist.name.placeholder"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm 
              text-gray-900 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-colors"
          />
        </div>

        <!-- Description Field -->
        <div class="space-y-2">
          <label for="description" class="block text-sm font-medium text-gray-700">
            {{ t.modals.createWishlist.description.label }}
          </label>
          <textarea
            id="description"
            v-model="description"
            :placeholder="t.modals.createWishlist.description.placeholder"
            rows="3"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm 
              text-gray-900 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              resize-none transition-colors"
          />
        </div>

        <!-- Due Date Field -->
        <div class="space-y-2">
          <label for="dueDate" class="block text-sm font-medium text-gray-700">
            {{ t.modals.createWishlist.dueDate.label }}
          </label>
          <div class="relative">
            <input
              type="date"
              id="dueDate"
              v-model="dueDate"
              :min="today"
              :placeholder="t.modals.createWishlist.dueDate.placeholder"
              :aria-label="t.modals.createWishlist.dueDate.ariaLabel"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                text-gray-900 text-sm placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-colors
                [&::-webkit-calendar-picker-indicator]:opacity-0
                [&::-webkit-calendar-picker-indicator]:w-full
                [&::-webkit-calendar-picker-indicator]:h-full
                [&::-webkit-calendar-picker-indicator]:absolute
                [&::-webkit-calendar-picker-indicator]:top-0
                [&::-webkit-calendar-picker-indicator]:left-0
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <Calendar class="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-800 
              hover:bg-gray-50 rounded-lg transition-colors"
          >
            {{ t.modals.createWishlist.actions.cancel }}
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2.5 text-sm font-medium text-white bg-primary 
              hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
            {{ isLoading ? t.modals.createWishlist.actions.creating : t.modals.createWishlist.actions.create }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { X, Calendar, Loader2 } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const props = defineProps<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, description: string, dueDate?: string) => Promise<void>
}>()

const t = useTranslations()
const name = ref('')
const description = ref('')
const dueDate = ref('')
const isLoading = ref(false)
const error = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const today = new Date().toISOString().split('T')[0]

// Focus name input when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      nameInput.value?.focus()
    }, 50)
  }
})

// Handle escape key
function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    props.onClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    await props.onSubmit(name.value, description.value, dueDate.value || undefined)
    name.value = ''
    description.value = ''
    dueDate.value = ''
    props.onClose()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t.modals.createWishlist.errors.failedToCreate
  } finally {
    isLoading.value = false
  }
}
</script> 