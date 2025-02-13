<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-900">{{ t.modals.editWishlist.title }}</h2>
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
            {{ t.modals.editWishlist.name.label }}
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            required
            :placeholder="t.modals.editWishlist.name.placeholder"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm 
              text-gray-900 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-colors"
          />
        </div>

        <!-- Description Field -->
        <div class="space-y-2">
          <label for="description" class="block text-sm font-medium text-gray-700">
            {{ t.modals.editWishlist.description.label }}
          </label>
          <textarea
            id="description"
            v-model="description"
            :placeholder="t.modals.editWishlist.description.placeholder"
            rows="3"
            class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm 
              text-gray-900 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              resize-none transition-colors h-32"
          />
        </div>

        <!-- Due Date Field -->
        <div class="space-y-2">
          <label for="dueDate" class="block text-sm font-medium text-gray-700">
            {{ t.modals.editWishlist.dueDate.label }}
          </label>
          <div class="relative">
            <input
              type="date"
              id="dueDate"
              v-model="dueDate"
              :placeholder="t.modals.editWishlist.dueDate.placeholder"
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
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="onClose"
            :disabled="isSubmitting"
            class="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-800 
              hover:bg-gray-50 rounded-lg transition-colors"
          >
            {{ t.modals.editWishlist.actions.cancel }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2.5 text-sm font-medium text-white bg-primary 
              hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary disabled:opacity-50 
              disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            <Loader2 v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4" />
            {{ t.modals.editWishlist.actions.save }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Calendar, Loader2 } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

interface InitialData {
  name: string
  description: string
  dueDate?: string
}

const props = defineProps<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; dueDate?: string | null }) => Promise<void>
  initialData: InitialData
}>()

const t = useTranslations()
const name = ref(props.initialData.name)
const description = ref(props.initialData.description)
const dueDate = ref(props.initialData.dueDate || '')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Update form when initialData changes
watch(() => props.initialData, (newData) => {
  name.value = newData.name
  description.value = newData.description
  dueDate.value = newData.dueDate || ''
})

async function handleSubmit() {
  isSubmitting.value = true
  error.value = null
  
  try {
    await props.onSubmit({
      name: name.value,
      description: description.value,
      dueDate: dueDate.value || null
    })
    props.onClose()
  } catch {
    error.value = t.modals.editWishlist.errors.failedToUpdate
  } finally {
    isSubmitting.value = false
  }
}
</script> 