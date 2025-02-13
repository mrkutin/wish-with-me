<template>
  <PageLayout>
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col space-y-4">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-semibold text-text-primary">{{ t.wishlists.title }}</h1>
              <p class="text-text-secondary mt-1">{{ t.wishlists.subtitle }}</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div class="relative w-full sm:w-64">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="wishlist-search"
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
                  >
                    <LayoutGrid class="h-4 w-4" />
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'p-2 rounded',
                      viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'
                    ]"
                  >
                    <List class="h-4 w-4" />
                  </button>
                </div>

                <button
                  @click="showCreateModal = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  {{ t.wishlists.create }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main v-if="!isLoadingWishlists && wishlists?.length === 0 && sharedWishlists?.length === 0" class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-white rounded-xl border border-gray-200/50 p-12 text-center">
        <div class="max-w-md mx-auto">
          <Gift class="h-12 w-12 mx-auto text-primary/40 mb-4" />
          <h3 class="text-lg font-medium text-text-primary mb-2">{{ t.wishlists.empty.title }}</h3>
          <p class="text-text-secondary mb-6">{{ t.wishlists.empty.description }}</p>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-primary-light transition-all"
          >
            <Plus class="h-4 w-4 mr-2" />
            {{ t.wishlists.createFirst }}
          </button>
        </div>
      </div>
    </main>

    <!-- Main content with wishlists -->
    <main v-if="isLoadingWishlists || wishlists?.length > 0 || sharedWishlists?.length > 0" class="max-w-7xl mx-auto px-6 py-8">
      <!-- My Wishlists Section -->
      <section>
        <template v-if="isLoadingWishlists">
          <div :class="[
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          ]">
            <WishlistSkeleton v-for="n in 3" :key="n" />
          </div>
        </template>
        <template v-else>
          <div :class="[
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          ]">
            <WishlistCard
              v-for="wishlist in filteredWishlists"
              :key="wishlist._id"
              :wishlist="wishlist"
              :view-mode="viewMode"
              @delete="handleDeleteWishlist"
              @update="() => handleWishlistUpdate(wishlist)"
            />
          </div>
        </template>
      </section>

      <!-- Shared Wishlists Section -->
      <section 
        v-if="sharedWishlists.length > 0"
        :class="{ 'mt-12': wishlists.length > 0 }"
      >
        <h2 class="text-xl font-semibold text-text-primary mb-6 flex items-center">
          <Share2 class="h-5 w-5 mr-2 text-primary/60" />
          {{ t.wishlists.shared.title }}
        </h2>
        <div :class="[
          'grid gap-6',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        ]">
          <WishlistCard
            v-for="wishlist in filteredSharedWishlists"
            :key="wishlist._id"
            :wishlist="wishlist"
            :view-mode="viewMode"
            :is-shared="true"
            @delete="handleUnshare"
            @update="() => {}"
          />
        </div>
      </section>
    </main>

    <!-- Modals -->
    <CreateWishlistModal
      :is-open="showCreateModal"
      :on-close="() => showCreateModal = false"
      :on-submit="handleCreateWishlist"
    />

    <EditWishlistModal
      :is-open="showEditModal"
      :on-close="() => {
        showEditModal = false
        editingWishlist = null
      }"
      :on-submit="handleEditSubmit"
      :initial-data="editingWishlist ? {
        name: editingWishlist.name,
        description: editingWishlist.description,
        dueDate: editingWishlist.dueDate
      } : { name: '', description: '', dueDate: '' }"
    />

    <ConfirmDeleteModal
      :is-open="!!deleteWishlist"
      :on-close="() => deleteWishlist = null"
      :on-confirm="confirmDelete"
      :is-loading="isDeleting"
      :title="t.modals.deleteWishlist.title"
      :message="t.modals.deleteWishlist.message.replace('{name}', deleteWishlist?.name || '')"
    />

    <ConfirmDeleteModal
      :is-open="showUnfollowModal"
      :title="t.wishlists.shared.unfollowConfirm.title"
      :message="t.wishlists.shared.unfollowConfirm.message"
      :is-loading="false"
      :confirm-text="t.wishlists.actions.unfollow"
      :on-close="() => showUnfollowModal = false"
      :on-confirm="confirmUnfollow"
    />

    <!-- Toasts -->
    <Toast
      v-if="showUndoToast"
      :message="t.wishlists.messages.deleted.replace('{name}', deletedWishlist?.name || '')"
      :action="{
        label: t.wishlists.actions.undo,
        onClick: handleUndo
      }"
      :duration="5000"
      @close="() => {
        showUndoToast = false
        deletedWishlist = null
      }"
    />

    <Toast
      v-if="showUnfollowUndoToast"
      :message="t.wishlists.shared.unfollowed.replace('{name}', unfollowedWishlist?.name || '')"
      :action="{
        label: t.wishlists.actions.undo,
        onClick: handleUnfollowUndo
      }"
      :duration="5000"
      @close="() => {
        showUnfollowUndoToast = false
        unfollowedWishlist = null
      }"
    />

    <ErrorToast
      v-if="errorToast"
      :message="errorToast"
      @close="() => errorToast = null"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  Gift, 
  Share2, 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTranslations } from '@/composables/useTranslations'
import WishlistCard from '@/components/WishlistCard.vue'
import WishlistSkeleton from '@/components/WishlistSkeleton.vue'
import CreateWishlistModal from '@/components/CreateWishlistModal.vue'
import EditWishlistModal from '@/components/EditWishlistModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import Toast from '@/components/Toast.vue'
import ErrorToast from '@/components/ErrorToast.vue'
import PageLayout from '@/components/PageLayout.vue'
import type { Wishlist } from '@/types/wishlist'

const router = useRouter()
const auth = useAuthStore()
const t = useTranslations()

const viewMode = ref(localStorage.getItem('viewMode') as 'grid' | 'list' || 'grid')
const searchQuery = ref('')
const wishlists = ref<Wishlist[]>([])
const sharedWishlists = ref<Wishlist[]>([])
const isLoadingWishlists = ref(true)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showUnfollowModal = ref(false)
const editingWishlist = ref<Wishlist | null>(null)
const unfollowingWishlist = ref<Wishlist | null>(null)
const deleteWishlist = ref<Wishlist | null>(null)
const isDeleting = ref(false)
const deletedWishlist = ref<Wishlist | null>(null)
const unfollowedWishlist = ref<Wishlist | null>(null)
const showUndoToast = ref(false)
const showUnfollowUndoToast = ref(false)
const errorToast = ref<string | null>(null)

// Save view mode to localStorage whenever it changes
watch(viewMode, (newValue) => {
  localStorage.setItem('viewMode', newValue)
})

// Computed properties for filtered wishlists
const filteredWishlists = computed(() => 
  wishlists.value.filter(w => 
    w.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const filteredSharedWishlists = computed(() => 
  sharedWishlists.value.filter(w => 
    w.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Fetch wishlists on mount
onMounted(async () => {
  if (!auth.user) {
    router.push('/login')
    return
  }
  
  await fetchWishlists()
})

async function fetchWishlists() {
  try {
    const [personalRes, sharedRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/wishlists`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Cache-Control': 'no-store'
        }
      }),
      fetch(`${import.meta.env.VITE_API_URL}/wishlists/shared`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Cache-Control': 'no-store'
        }
      })
    ])

    if (!personalRes.ok || !sharedRes.ok) {
      throw new Error(t.wishlists.errors.failedToFetch)
    }

    const [personalData, sharedData] = await Promise.all([
      personalRes.json(),
      sharedRes.json()
    ])

    wishlists.value = personalData
    sharedWishlists.value = sharedData
  } catch (error) {
    console.error(t.wishlists.errors.failedToFetch, error)
    errorToast.value = t.wishlists.errors.failedToFetch
  } finally {
    isLoadingWishlists.value = false
  }
}

async function handleCreateWishlist(name: string, description: string, dueDate?: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, dueDate })
  })

  if (!res.ok) {
    throw new Error(t.wishlists.errors.failedToCreate)
  }

  await fetchWishlists()
}

async function handleEditSubmit(data: { name: string; description: string; dueDate?: string | null }) {
  if (!editingWishlist.value) return

  const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${editingWishlist.value._id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error(t.wishlists.errors.failedToUpdate)
  }

  await fetchWishlists()
  showEditModal.value = false
  editingWishlist.value = null
}

async function handleDeleteWishlist(wishlist: Wishlist) {
  deleteWishlist.value = wishlist
}

async function confirmDelete() {
  if (!deleteWishlist.value) return

  isDeleting.value = true
  try {
    const wishlistToDelete = deleteWishlist.value
    
    // Remove from UI immediately
    wishlists.value = wishlists.value.filter(w => w._id !== wishlistToDelete._id)
    deleteWishlist.value = null
    
    // Show undo toast
    deletedWishlist.value = wishlistToDelete
    showUndoToast.value = true
    
    // Delete from server
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${wishlistToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      throw new Error(t.wishlists.errors.failedToDelete)
    }
  } catch (err) {
    // Restore the wishlist in UI if deletion failed
    if (deletedWishlist.value) {
      wishlists.value = [...wishlists.value, deletedWishlist.value]
    }
    errorToast.value = t.wishlists.errors.failedToDelete
  } finally {
    isDeleting.value = false
  }
}

async function handleUndo() {
  if (!deletedWishlist.value) return

  try {
    // Restore in UI immediately
    wishlists.value = [...wishlists.value, deletedWishlist.value]
    showUndoToast.value = false
    
    // Restore in backend
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: deletedWishlist.value.name,
        description: deletedWishlist.value.description
      })
    })

    if (!res.ok) {
      throw new Error(t.wishlists.errors.failedToRestore)
    }
    
    deletedWishlist.value = null
  } catch (error) {
    // Remove from UI if restoration failed
    if (deletedWishlist.value) {
      wishlists.value = wishlists.value.filter(w => w._id !== deletedWishlist.value?._id)
    }
    errorToast.value = t.wishlists.errors.failedToRestore
  }
}

function handleUnshare(wishlist: Wishlist) {
  unfollowingWishlist.value = wishlist
  showUnfollowModal.value = true
}

async function confirmUnfollow() {
  try {
    if (!unfollowingWishlist.value) return

    // Store wishlist for potential undo
    const wishlistToUnfollow = unfollowingWishlist.value
    
    // Remove from UI immediately
    sharedWishlists.value = sharedWishlists.value.filter(w => w._id !== wishlistToUnfollow._id)
    unfollowingWishlist.value = null
    showUnfollowModal.value = false
    
    // Show undo toast
    unfollowedWishlist.value = wishlistToUnfollow
    showUnfollowUndoToast.value = true

    // Unfollow on server
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists/${wishlistToUnfollow._id}/unfollow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetUserId: auth.user?.id
      })
    })

    if (!res.ok) {
      throw new Error(t.wishlists.errors.failedToUpdate)
    }
  } catch (error) {
    // Restore the wishlist in UI if unfollowing failed
    if (unfollowedWishlist.value) {
      sharedWishlists.value = [...sharedWishlists.value, unfollowedWishlist.value]
    }
    errorToast.value = t.wishlists.errors.failedToUpdate
  }
}

async function handleUnfollowUndo() {
  if (!unfollowedWishlist.value) return

  try {
    // Restore in UI immediately
    sharedWishlists.value = [...sharedWishlists.value, unfollowedWishlist.value]
    showUnfollowUndoToast.value = false

    // Use the shared token for following
    if (!unfollowedWishlist.value.sharedToken) {
      throw new Error('No shared token available')
    }
    router.push(`/wishlists/follow/${unfollowedWishlist.value.sharedToken}`)
  } catch (error) {
    // Remove from UI if restoration failed
    if (unfollowedWishlist.value) {
      sharedWishlists.value = sharedWishlists.value.filter(w => w._id !== unfollowedWishlist.value?._id)
    }
    errorToast.value = t.wishlists.errors.failedToRestore
  }
}

async function handleWishlistUpdate(wishlist: Wishlist) {
  editingWishlist.value = wishlist
  showEditModal.value = true
}
</script> 