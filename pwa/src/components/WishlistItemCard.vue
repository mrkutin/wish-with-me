<template>
  <div :class="[
    'bg-white rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-all',
    viewMode === 'grid' ? 'h-full' : ''
  ]">
    <!-- Grid Layout -->
    <div v-if="viewMode === 'grid'" class="p-4 flex flex-col h-full">
      <div class="flex gap-4">
        <!-- Image/Icon Section -->
        <div class="relative w-24 h-24 flex-shrink-0">
          <div v-if="showIcon" :class="[
            'w-full h-full bg-gray-100 rounded-md flex items-center justify-center',
            item.bought ? 'opacity-50' : ''
          ]">
            <ShoppingBag class="w-1/2 h-1/2 text-gray-400" />
          </div>
          <div v-else class="relative w-full h-full">
            <img
              :src="item.image"
              :alt="`Image of ${item.name}`"
              class="object-contain rounded-md w-full h-full"
              :class="{ 'opacity-50': item.bought }"
              @error="handleImageError"
            />
            <div v-if="item.bought" class="absolute inset-0 bg-success/10 rounded-md" />
          </div>
        </div>

        <!-- Content Section -->
        <div class="flex-1 min-w-0 flex flex-col">
          <div class="flex justify-between items-start gap-2">
            <h3 
              :class="[
                'font-medium text-base line-clamp-4 flex-1',
                item.bought ? 'text-text-secondary' : 'text-text-primary'
              ]"
              :title="item.name"
            >
              {{ item.name }}
            </h3>
            <div class="flex gap-2">
              <button
                @click="handleToggleBought"
                class="text-text-secondary hover:text-primary p-1 flex-shrink-0 transition-colors"
              >
                <span class="sr-only">
                  {{ item.bought ? t.wishlists.item.markAsNotBought : t.wishlists.item.markAsBought }}
                </span>
                <component :is="item.bought ? CheckCircle : Circle" class="w-5 h-5" />
              </button>
              <button
                v-if="isOwner"
                @click="showDeleteConfirm = true"
                class="text-text-secondary hover:text-error p-1 flex-shrink-0 transition-colors"
              >
                <span class="sr-only">{{ t.wishlists.item.delete }}</span>
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Price -->
          <p v-if="item.price" :class="[
            'mt-auto mb-2 text-sm text-right',
            item.bought ? 'text-text-secondary' : 'text-text-primary'
          ]">
            {{ formatPrice }}
          </p>
          <div v-else class="mb-2 text-sm text-text-secondary text-right">
            {{ t.wishlists.item.noPrice }}
          </div>

          <!-- Buy Button -->
          <div class="pt-3 border-t border-border flex justify-end">
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleBuyClick"
              :class="[
                'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-90 w-32',
                item.bought ? 'opacity-50' : ''
              ]"
              :style="marketplaceStyle"
            >
              <ShoppingCart class="h-4 w-4" />
              {{ t.wishlists.item.buy }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- List Layout -->
    <div v-else class="p-4 flex flex-col gap-4">
      <div class="flex gap-4">
        <!-- Image Section -->
        <div class="relative w-24 h-24 flex-shrink-0">
          <div v-if="showIcon" :class="[
            'w-full h-full bg-gray-100 rounded-md flex items-center justify-center',
            item.bought ? 'opacity-50' : ''
          ]">
            <ShoppingBag class="w-1/2 h-1/2 text-gray-400" />
          </div>
          <div v-else class="relative w-full h-full">
            <img
              :src="item.image"
              :alt="`Image of ${item.name}`"
              class="object-contain rounded-md w-full h-full"
              :class="{ 'opacity-50': item.bought }"
              @error="handleImageError"
            />
            <div v-if="item.bought" class="absolute inset-0 bg-success/10 rounded-md" />
          </div>
        </div>

        <!-- Content Section -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium line-clamp-4">
                {{ item.name }}
              </h3>
              <div v-if="item.description" class="mt-1 text-text-secondary text-sm line-clamp-1">
                {{ item.description }}
              </div>
            </div>

            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button
                  @click="handleToggleBought"
                  class="text-text-secondary hover:text-primary p-1 flex-shrink-0 transition-colors"
                >
                  <span class="sr-only">
                    {{ item.bought ? t.wishlists.item.markAsNotBought : t.wishlists.item.markAsBought }}
                  </span>
                  <component :is="item.bought ? CheckCircle : Circle" class="w-5 h-5" />
                </button>
                <button
                  v-if="isOwner"
                  @click="showDeleteConfirm = true"
                  class="text-text-secondary hover:text-error p-1 flex-shrink-0 transition-colors"
                >
                  <span class="sr-only">{{ t.wishlists.item.delete }}</span>
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
              <!-- Price -->
              <div v-if="item.price" class="text-sm">
                {{ formatPrice }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Buy Button -->
      <div class="flex justify-end mt-auto pt-4 border-t border-border">
        <a
          v-if="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleBuyClick"
          :class="[
            'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-90 w-32',
            item.bought ? 'opacity-50' : ''
          ]"
          :style="marketplaceStyle"
        >
          <ShoppingCart class="h-4 w-4" />
          {{ t.wishlists.item.buy }}
        </a>
      </div>
    </div>

    <!-- Modals and Toasts -->
    <ConfirmDeleteModal
      :is-open="showDeleteConfirm"
      :on-close="() => showDeleteConfirm = false"
      :on-confirm="handleDelete"
      :is-loading="isDeleting"
      :title="t.wishlists.item.deleteConfirm.title"
      :message="t.wishlists.item.deleteConfirm.message"
    />

    <ErrorToast
      v-if="error"
      :message="error"
      @close="error = null"
    />

    <SuccessToast
      v-if="success"
      :message="success"
      @close="success = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShoppingBag, Trash2, ShoppingCart, Circle, CheckCircle } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'
import { getMarketplace } from '@/utils/marketplace'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import SuccessToast from './SuccessToast.vue'
import ErrorToast from './ErrorToast.vue'

interface WishlistItem {
  _id: string
  name: string
  description?: string
  price?: number
  currency?: string
  url?: string
  image?: string
  bought: boolean
}

const props = defineProps<{
  item: WishlistItem
  isOwner: boolean
  viewMode?: 'grid' | 'list'
}>()

const emit = defineEmits<{
  (e: 'delete', itemId: string): void
  (e: 'update', itemId: string, updates: Partial<WishlistItem>): void
}>()

const t = useTranslations()
const showIcon = ref(!props.item.image)
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Marketplace styles
const marketplaceStyles = {
  ozon: { bg: '#005bff', hover: '#0040b0', text: 'white', icon: '🛍️' },
  yandex: { bg: '#ffcc00', hover: '#e6b800', text: 'black', icon: '🛒' },
  wb: { bg: '#cb11ab', hover: '#a80d8e', text: 'white', icon: '🛍️' },
  aliexpress: { bg: '#ff4747', hover: '#e63939', text: 'white', icon: '🛍️' }
} as const

type MarketplaceName = keyof typeof marketplaceStyles

const defaultMarketplaceStyle = {
  bg: '#4f46e5',
  text: 'white'
}

const marketplace = computed(() => 
  props.item.url ? getMarketplace(props.item.url) : null
)

const marketplaceStyle = computed(() => {
  const style = marketplace.value
    ? marketplaceStyles[marketplace.value.name.toLowerCase() as MarketplaceName]
    : defaultMarketplaceStyle
  
  return {
    backgroundColor: style.bg,
    color: style.text
  }
})

type CurrencyCode = keyof typeof t.currencies

const formatPrice = computed(() => {
  if (!props.item.price) return ''
  return `${props.item.price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${props.item.currency && t.currencies[props.item.currency as CurrencyCode] || props.item.currency}`
})

function handleImageError() {
  showIcon.value = true
}

async function handleToggleBought() {
  try {
    await emit('update', props.item._id, { bought: !props.item.bought })
    success.value = props.item.bought 
      ? t.wishlists.item.status.notBought 
      : t.wishlists.item.status.bought
  } catch {
    error.value = 'Failed to update item'
  }
}

async function handleBuyClick(e: MouseEvent) {
  if (!props.item.bought) {
    e.preventDefault()
    try {
      await emit('update', props.item._id, { bought: true })
      success.value = t.wishlists.item.status.bought
      setTimeout(() => {
        window.open(props.item.url, '_blank')
      }, 100)
    } catch {
      error.value = 'Failed to update item'
    }
  }
}

function handleDelete() {
  isDeleting.value = true
  emit('delete', props.item._id)
  showDeleteConfirm.value = false
  isDeleting.value = false
}
</script> 