<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-background rounded-lg shadow-lg w-full max-w-md">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-text-primary mb-4">{{ title }}</h2>
        <p class="text-text-secondary">{{ message }}</p>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="onClose"
            class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ t.modals.deleteWishlist.actions.cancel }}
          </button>
          <button
            @click="onConfirm"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ confirmText || (isLoading ? t.modals.deleteWishlist.actions.deleting : t.modals.deleteWishlist.actions.confirm) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const t = useTranslations()

defineProps<{
  isOpen: boolean
  title: string
  message: string
  isLoading: boolean
  confirmText?: string
  onClose: () => void
  onConfirm: () => void
}>()
</script> 