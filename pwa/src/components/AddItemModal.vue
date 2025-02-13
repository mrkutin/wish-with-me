<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-background rounded-lg shadow-lg w-full max-w-md">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-lg font-semibold text-text-primary">{{ t.modals.addItem.title }}</h2>
        <button
          @click="onClose"
          class="text-text-secondary hover:text-text-primary transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div v-if="error" class="p-3.5 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {{ error }}
        </div>

        <!-- URL Field with Resolve Button -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t.modals.addItem.url.label }}</label>
          <div class="flex gap-2">
            <input
              ref="urlInput"
              type="url"
              v-model="formData.url"
              @blur="handleUrlBlur"
              :placeholder="t.modals.addItem.url.placeholder"
              class="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt"
            />
            <button
              type="button"
              @click="handleUrlBlur"
              :disabled="isResolving || !formData.url"
              class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Loader2 v-if="isResolving" class="h-5 w-5 animate-spin" />
              <Search v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-text-primary mb-1">
            <Type class="h-4 w-4 mr-1 text-text-secondary inline" />
            {{ t.modals.addItem.name.label }}
          </label>
          <input
            ref="nameInput"
            type="text"
            id="name"
            v-model="formData.name"
            required
            :placeholder="t.modals.addItem.name.placeholder"
            class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt"
          />
        </div>

        <!-- Price Fields -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="price" class="block text-sm font-medium text-text-primary mb-1">
              {{ t.modals.addItem.price.label }}
            </label>
            <input
              type="number"
              id="price"
              v-model.number="resolvedItem.price"
              min="0"
              step="0.01"
              :placeholder="t.modals.addItem.price.placeholder"
              class="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
            />
          </div>

          <div>
            <label for="currency" class="block text-sm font-medium text-text-primary mb-1">
              {{ t.modals.addItem.currency.label }}
            </label>
            <input
              type="text"
              id="currency"
              v-model.trim="resolvedItem.currency"
              :placeholder="t.modals.addItem.currency.placeholder"
              class="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
            />
          </div>
        </div>

        <!-- Description Field -->
        <div>
          <label for="description" class="block text-sm font-medium text-text-primary mb-1">
            {{ t.modals.addItem.description.label }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            :placeholder="t.modals.addItem.description.placeholder"
            rows="3"
            class="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary resize-none"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            @click="onClose"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ t.modals.addItem.actions.cancel }}
          </button>
          <button
            type="submit"
            :disabled="isLoading || !formData.name"
            class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            <Loader2 v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
            {{ isLoading ? t.modals.addItem.actions.adding : t.modals.addItem.actions.add }}
          </button>
        </div>
      </form>
    </div>

    <SuccessToast
      v-if="successMessage"
      :message="successMessage"
      @close="successMessage = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Loader2, Type, Search } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'
import SuccessToast from './SuccessToast.vue'
import { useAuthStore } from '@/stores/auth'

interface ResolvedItem {
  name: string
  price?: number
  currency?: string
  image?: string
}

const props = defineProps<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    url?: string
    price?: number
    currency?: string
    description?: string
    image?: string
  }) => Promise<void>
}>()

const t = useTranslations()
const auth = useAuthStore()
const formData = ref({
  name: '',
  url: '',
  description: ''
})
const resolvedItem = ref<ResolvedItem>({
  name: '',
  price: undefined,
  currency: undefined,
  image: undefined
})
const isLoading = ref(false)
const isResolving = ref(false)
const error = ref('')
const urlInput = ref<HTMLInputElement | null>(null)
const successMessage = ref<string | null>(null)
const resolveStatus = ref<'idle' | 'resolving' | 'success' | 'error'>('idle')

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      urlInput.value?.focus()
    }, 50)
  } else {
    // Reset form when modal closes
    formData.value = {
      name: '',
      url: '',
      description: ''
    }
    resolvedItem.value = {
      name: '',
      price: undefined,
      currency: undefined,
      image: undefined
    }
    error.value = ''
    successMessage.value = null
    resolveStatus.value = 'idle'
  }
})

async function handleUrlBlur() {
  if (!formData.value.url) return
  
  isResolving.value = true
  resolveStatus.value = 'resolving'
  error.value = ''
  successMessage.value = null
  
  try {
    // Note: Third-party cookies warning in console is expected when resolving items from external sites
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/resolve-item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: formData.value.url })
    })
    const data = await res.json()
    
    if (res.ok && data) {
      formData.value.name = data.name || formData.value.name || ''
      resolvedItem.value = data
      resolveStatus.value = 'success'
      successMessage.value = 'Item details resolved successfully'
    } else {
      resolveStatus.value = 'idle'
      error.value = t.modals.addItem.errors.failedToResolve
    }
  } catch {
    resolveStatus.value = 'error'
    error.value = t.modals.addItem.errors.failedToResolve
  } finally {
    isResolving.value = false
  }
}

async function handleSubmit() {
  isLoading.value = true
  error.value = ''

  try {
    await props.onSubmit({
      name: formData.value.name,
      url: formData.value.url || undefined,
      price: resolvedItem.value?.price,
      currency: resolvedItem.value?.currency,
      image: resolvedItem.value?.image,
      description: formData.value.description || undefined
    })
    props.onClose()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t.modals.addItem.errors.failedToAdd
  } finally {
    isLoading.value = false
  }
}
</script> 