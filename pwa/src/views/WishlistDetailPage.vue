<template>
  <PageLayout>
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col space-y-4">
          <router-link 
            to="/wishlists"
            class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mb-4 group"
          >
            <ArrowLeft class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {{ t.common.back }}
          </router-link>

          <div v-if="wishlist" class="flex flex-col space-y-4">
            <!-- Title and Controls Row -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <!-- Title Section -->
              <div class="flex-1">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Gift :class="[
                      'h-5 w-5',
                      statusColors[getDueDateStatus(wishlist.dueDate)].icon
                    ]" />
                  </div>
                  <h1 class="text-2xl font-semibold text-text-primary truncate">
                    {{ wishlist.name }}
                  </h1>
                </div>
                <div v-if="wishlist.sharedWith?.length" class="mt-3 flex items-center gap-2">
                  <Share2 class="h-4 w-4 text-primary/60" />
                  <div class="flex items-center">
                    <span class="text-sm text-text-secondary">{{ t.wishlists.shared.sharedWith }}:</span>
                    <div class="flex items-center ml-2">
                      <div 
                        v-for="(user, index) in wishlist.sharedWith" 
                        :key="user.id"
                        class="inline-flex items-center"
                      >
                        <span class="text-sm text-text-secondary">{{ user.name }}</span>
                        <span 
                          v-if="index < wishlist.sharedWith.length - 1" 
                          class="text-text-secondary"
                        >, </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Controls Row -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
                <div class="relative w-full sm:w-64">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="item-search"
                    name="item-search"
                    v-model="searchQuery"
                    :placeholder="t.wishlists.search"
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200/50 focus:ring-2 focus:ring-primary/20 focus:border-transparent bg-white"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <div class="flex items-center bg-white rounded-lg border border-gray-200/50 p-1">
                    <button
                      @click="viewMode = 'grid'"
                      :class="[
                        'p-2 rounded',
                        viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'
                      ]"
                      :title="t.wishlists.viewMode.grid"
                    >
                      <LayoutGrid class="h-4 w-4" />
                    </button>
                    <button
                      @click="viewMode = 'list'"
                      :class="[
                        'p-2 rounded',
                        viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'
                      ]"
                      :title="t.wishlists.viewMode.list"
                    >
                      <List class="h-4 w-4" />
                    </button>
                  </div>

                  <div v-if="isOwner" class="flex items-center bg-white rounded-lg border border-gray-200/50 p-1">
                    <button
                      @click="showEditModal = true"
                      class="p-2 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      :title="t.modals.editWishlist.title"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button
                      @click="showShareModal = true"
                      class="p-2 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      :title="t.modals.shareWishlist.title"
                    >
                      <Share2 class="h-4 w-4" />
                    </button>
                    <button
                      @click="showDeleteModal = true"
                      class="p-2 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      :title="t.modals.deleteWishlist.title"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    v-if="isOwner"
                    @click="showAddModal = true"
                    class="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shrink-0"
                  >
                    <Plus class="h-4 w-4 mr-2" />
                    <span class="whitespace-nowrap">{{ t.wishlists.item.add }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Description and Due Date Row -->
            <div class="flex flex-wrap items-center gap-y-2 text-sm text-text-secondary">
              <div class="flex-1 min-w-0">
                <div v-if="wishlist.description" class="flex items-center gap-2">
                  <Star class="h-4 w-4 text-yellow-500" />
                  <p class="truncate">{{ wishlist.description }}</p>
                </div>
              </div>
              <div v-if="wishlist.dueDate" class="flex items-center gap-2 flex-shrink-0 ml-auto">
                <div :class="[
                  'text-[11px] font-medium px-2 py-0.5 rounded-full',
                  statusColors[getDueDateStatus(wishlist.dueDate)].badge
                ]">
                  {{ formatDueDate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-error/10 border border-error/20 text-error rounded-lg p-4">
        {{ error }}
      </div>
    </div>

    <!-- Empty State -->
    <main v-else-if="wishlist?.items.length === 0" class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-white rounded-xl border border-gray-200/50 p-12 text-center">
        <div class="max-w-md mx-auto">
          <Package class="h-12 w-12 mx-auto text-primary/40 mb-4" />
          <h3 class="text-lg font-medium text-text-primary mb-2">{{ t.wishlists.item.empty.title }}</h3>
          <p class="text-text-secondary mb-6">{{ t.wishlists.item.empty.description }}</p>
          <button
            v-if="isOwner"
            @click="showAddModal = true"
            class="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-primary-light transition-all"
          >
            <Plus class="h-4 w-4 mr-2" />
            {{ t.wishlists.item.addFirst }}
          </button>
        </div>
      </div>
    </main>

    <!-- Items List -->
    <main v-else-if="wishlist" class="max-w-7xl mx-auto px-6 py-8">
      <div class="space-y-8">
        <div v-for="[marketplaceName, items] in Object.entries(groupedItems) as [MarketplaceName, WishlistItem[]][]" :key="marketplaceName" class="space-y-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <h2 class="text-lg font-medium capitalize">
                {{ marketplaceName === 'other' ? t.wishlists.item.other : t.marketplaces[marketplaceName as MarketplaceKey] }}
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-text-secondary">
                {{ items.length }} {{ items.length === 1 ? t.wishlists.item.count.one : t.wishlists.item.count.many }}
              </span>
            </div>
          </div>
          <div :class="[
            'grid gap-6',
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          ]">
            <WishlistItemCard
              v-for="item in items"
              :key="item._id"
              :item="item"
              :is-owner="isOwner"
              @delete="handleDeleteItem"
              @update="handleUpdateItem"
              :view-mode="viewMode"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <AddItemModal
      :is-open="showAddModal"
      :on-close="() => showAddModal = false"
      :on-submit="handleAddItem"
    />

    <EditWishlistModal
      v-if="wishlist"
      :is-open="showEditModal"
      :on-close="() => showEditModal = false"
      :on-submit="handleEditSubmit"
      :initial-data="{
        name: wishlist.name,
        description: wishlist.description || '',
        dueDate: wishlist.dueDate
      }"
    />

    <ShareWishlistModal
      v-if="wishlist"
      :is-open="showShareModal"
      :on-close="() => showShareModal = false"
      :shared-token="wishlist.sharedToken"
    />

    <ConfirmDeleteModal
      :is-open="showDeleteModal"
      :on-close="() => showDeleteModal = false"
      :on-confirm="handleDelete"
      :is-loading="isDeleting"
      :title="t.modals.deleteWishlist.title"
      :message="t.modals.deleteWishlist.message.replace('{name}', wishlist?.name || '')"
    />

    <!-- Toasts -->
    <SuccessToast
      v-if="successMessage"
      :message="successMessage"
      @close="successMessage = ''"
    />

    <ErrorToast
      v-if="errorMessage"
      :message="errorMessage"
      @close="errorMessage = ''"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Gift, Star, Package, Share2, Edit, Trash2, LayoutGrid, List, Search } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTranslations } from '@/composables/useTranslations'
import { groupItemsByMarketplace } from '@/utils/marketplace'
import type { WishlistItem } from '@/types/wishlist'
import PageLayout from '@/components/PageLayout.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import WishlistItemCard from '@/components/WishlistItemCard.vue'
import AddItemModal from '@/components/AddItemModal.vue'
import EditWishlistModal from '@/components/EditWishlistModal.vue'
import ShareWishlistModal from '@/components/ShareWishlistModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import SuccessToast from '@/components/SuccessToast.vue'
import ErrorToast from '@/components/ErrorToast.vue'

interface Wishlist {
  _id: string
  name: string
  description?: string
  items: WishlistItem[]
  createdAt: string
  updatedAt: string
  userId: string
  dueDate?: string
  sharedToken?: string
  sharedWith?: { id: string; name: string }[]
}

type MarketplaceName = 'ozon' | 'yandex' | 'wb' | 'aliexpress' | 'other'
type MarketplaceKey = keyof typeof t.marketplaces

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const t = useTranslations()

const wishlist = ref<Wishlist | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const searchQuery = ref('')
const viewMode = ref(localStorage.getItem('viewMode') as 'grid' | 'list' || 'grid')

// Save view mode to localStorage whenever it changes
watch(viewMode, (newValue) => {
  localStorage.setItem('viewMode', newValue)
})

const isOwner = computed(() => wishlist.value?.userId === auth.user?.id)

// Filter items based on search query
const filteredItems = computed(() => {
  if (!wishlist.value) return []
  return wishlist.value.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const groupedItems = computed(() => {
  return groupItemsByMarketplace(filteredItems.value)
})

const statusColors = {
  'more-than-30': { icon: 'text-blue-600', badge: 'bg-blue-50 text-blue-600' },
  '7-30': { icon: 'text-orange-600', badge: 'bg-orange-50 text-orange-600' },
  'less-than-7': { icon: 'text-red-600', badge: 'bg-red-50 text-red-600' },
  'expired': { icon: 'text-gray-500', badge: 'bg-gray-50 text-gray-500' },
  'no-date': { icon: 'text-gray-500', badge: 'bg-gray-50 text-gray-500' }
}

const formatDueDate = computed(() => {
  if (!wishlist.value?.dueDate) return ''
  
  const dueDate = new Date(wishlist.value.dueDate)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return t.wishlists.dates.expired
  if (diffDays === 0) return t.wishlists.dates.due + ' ' + t.wishlists.dates.today
  
  const daysText = t.wishlists.dates.days[getCountForm(diffDays)]
  return `${t.wishlists.dates.due} ${diffDays} ${daysText}`
})

function getDueDateStatus(dueDate?: string) {
  if (!dueDate) return 'no-date'
  
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = due.getTime() - today.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 7) return 'less-than-7'
  if (daysRemaining <= 30) return '7-30'
  return 'more-than-30'
}

function getCountForm(count: number): 'one' | 'few' | 'many' {
  count = Math.abs(count)
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastDigit === 1 && lastTwoDigits !== 11) return 'one'
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) return 'few'
  return 'many'
}

onMounted(async () => {
  if (!auth.user) {
    router.push('/login')
    return
  }
  
  await fetchWishlist()
})

async function fetchWishlist() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Wishlist not found')
      }
      throw new Error('Failed to fetch wishlist')
    }

    wishlist.value = await res.json()
  } catch (err) {
    error.value = 'Failed to fetch wishlist'
  } finally {
    loading.value = false
  }
}

async function handleAddItem(data: {
  name: string
  url?: string
  price?: number
  currency?: string
  image?: string
}) {
  try {
    // Check if item with this URL already exists
    if (data.url && wishlist.value) {
      const existingItem = wishlist.value.items.find(item => 
        item.url && new URL(item.url).href === new URL(data.url!).href
      )
      
      if (existingItem) {
        throw new Error(t.modals.addItem.errors.alreadyExists)
      }
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.id}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || t.modals.addItem.errors.failedToAdd)
    }

    const newItem = await res.json()
    
    // Update local state
    if (wishlist.value) {
      wishlist.value.items = [...wishlist.value.items, newItem]
    }

    showAddModal.value = false
    successMessage.value = t.modals.addItem.success
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t.modals.addItem.errors.failedToAdd)
  }
}

async function handleDelete() {
  isDeleting.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      throw new Error(t.modals.deleteWishlist.errors.failedToDelete)
    }
    
    router.push('/wishlists')
  } catch (err) {
    errorMessage.value = t.modals.deleteWishlist.errors.failedToDelete
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

async function handleEditSubmit(data: { 
  name: string
  description: string
  dueDate?: string | null 
}) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${wishlist.value?._id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error(t.modals.editWishlist.errors.failedToUpdate)
    
    const updatedWishlist = await res.json()
    wishlist.value = updatedWishlist
    successMessage.value = t.modals.editWishlist.success
    showEditModal.value = false
  } catch {
    errorMessage.value = t.modals.editWishlist.errors.failedToUpdate
  }
}

async function handleDeleteItem(itemId: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.id}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      throw new Error('Failed to delete item')
    }

    // Update local state
    if (wishlist.value) {
      wishlist.value.items = wishlist.value.items.filter(item => item._id !== itemId)
    }
  } catch {
    errorMessage.value = 'Failed to delete item'
  }
}

async function handleUpdateItem(itemId: string, updates: Partial<WishlistItem>) {
  try {
    if (!wishlist.value) return

    // Get the current item
    const currentItem = wishlist.value.items.find(item => item._id === itemId)
    if (!currentItem) return

    // Send all existing data plus updates
    const updatedData = {
      ...currentItem,
      ...updates,
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${route.params.id}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(updatedData)
    })

    if (!res.ok) {
      throw new Error('Failed to update item')
    }

    // Update local state
    if (wishlist.value) {
      wishlist.value.items = wishlist.value.items.map(item => 
        item._id === itemId ? { ...item, ...updates } : item
      )
    }
  } catch {
    errorMessage.value = 'Failed to update item'
  }
}
</script> 