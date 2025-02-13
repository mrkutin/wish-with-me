<template>
  <ShareWishlistModal
    :is-open="showShareModal"
    :on-close="() => showShareModal = false"
    :shared-token="wishlist.sharedToken"
  />
  <div class="bg-white rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all p-5 flex flex-col cursor-pointer"
    :class="[
      viewMode === 'grid' ? 'h-[240px]' : 
      'md:h-[140px] min-h-[160px]'
    ]"
    @click="router.push(`/wishlists/${wishlist._id}`)"
  >
    <div class="flex items-start justify-between"
      :class="[
        viewMode === 'list' && 'flex-1 md:mr-8'
      ]"
    >
      <div class="flex-1">
        <div class="flex items-start gap-2.5">
          <div class="flex-shrink-0 mt-[2px]">
            <GiftIcon :class="[
              'h-5 w-5',
              statusColors.icon
            ]" />
          </div>
          <h3 class="text-lg font-medium text-text-primary truncate leading-6">
            {{ wishlist.name }}
          </h3>
        </div>
        
        <p class="text-text-secondary/80 text-sm leading-relaxed"
          :class="[
            viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1 md:-mb-1'
          ]"
        >
          {{ wishlist.description }}
        </p>
      </div>

      <!-- Dropdown Menu -->
      <div class="relative">
        <button
          @click.stop="showDropdown = !showDropdown"
          class="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
        >
          <MoreVertical class="h-5 w-5" />
        </button>

        <!-- Dropdown Content -->
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white border border-gray-200/50 py-1 z-10"
        >
          <button
            v-if="!isShared"
            @click.stop="handleEdit"
            class="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Edit class="h-4 w-4" />
            {{ t.wishlists.actions.edit }}
          </button>
          <button
            v-if="!isShared"
            @click.stop="handleShare"
            class="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Share2 class="h-4 w-4" />
            {{ t.wishlists.actions.share }}
          </button>
          <button
            @click.stop="handleDelete"
            class="w-full px-4 py-2.5 text-sm text-left text-error hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Trash2 class="h-4 w-4" />
            {{ isShared ? t.wishlists.actions.unfollow : t.wishlists.actions.delete }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Date and Items -->
        <div class="flex items-center gap-2 text-gray-500">
          <CalendarIcon class="h-5 w-5" />
          <span class="text-sm font-medium">{{ formatDate(wishlist.dueDate) }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-500">
          <Gift class="h-5 w-5" />
          <span class="text-sm">
            <span class="font-medium">{{ wishlist.items?.length || 0 }}</span>
            <span class="ml-1">{{ t.wishlists.item.count[getCountForm(wishlist.items?.length || 0)] }}</span>
          </span>
        </div>
      </div>
      <div v-if="wishlist.sharedWith?.length" class="flex items-center gap-2">
        <Share2 class="h-4 w-4 text-gray-400" />
        <div class="text-sm text-gray-500">
          <span>{{ wishlist.sharedWith[0].name }}{{ wishlist.sharedWith.length > 1 ? '...' : '' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Edit, Trash2, Gift, Calendar as CalendarIcon, MoreVertical, Gift as GiftIcon, Share2 } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'
import ShareWishlistModal from './ShareWishlistModal.vue'
import { useRouter } from 'vue-router'
import { getCountForm } from '@/utils/text'

interface WishlistItem {
  _id: string
  name: string
  description?: string
  url?: string
  price?: number
  currency?: string
  image?: string
  purchased?: boolean
  createdAt: string
  updatedAt: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  bought?: boolean
}

interface Wishlist {
  _id: string
  userId: string
  userName: string
  name: string
  description: string
  dueDate?: string
  items: WishlistItem[]
  sharedWith: Array<{ userId: string; name: string }>
  sharedToken?: string
  createdAt: string
  updatedAt: string
}

const emit = defineEmits<{
  (e: 'delete', wishlist: Wishlist): void
  (e: 'update'): void
}>()

const props = defineProps<{
  wishlist: Wishlist
  viewMode: 'grid' | 'list'
  isShared?: boolean
}>()

const t = useTranslations()
const router = useRouter()

const showDropdown = ref(false)
const showShareModal = ref(false)

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleEdit() {
  showDropdown.value = false
  emit('update')
}

function handleDelete() {
  showDropdown.value = false
  emit('delete', props.wishlist)
}

function handleShare() {
  showDropdown.value = false
  showShareModal.value = true
}

// Add formatDate function
function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleString('ru-RU', { month: 'short' }).replace('.', '')
  return `${day} ${month}`
}

// Add status computation
const status = computed(() => {
  if (!props.wishlist.dueDate) return 'no-date'
  
  const dueDate = new Date(props.wishlist.dueDate)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 7) return 'less-than-7'
  if (daysRemaining <= 30) return '7-30'
  return 'more-than-30'
})

// Add color classes based on status
const statusColors = computed(() => {
  const colors = {
    'more-than-30': { icon: 'text-blue-600', badge: 'bg-blue-50 text-blue-600' },
    '7-30': { icon: 'text-orange-600', badge: 'bg-orange-50 text-orange-600' },
    'less-than-7': { icon: 'text-red-600', badge: 'bg-red-50 text-red-600' },
    'expired': { icon: 'text-gray-500', badge: 'bg-gray-50 text-gray-500' },
    'no-date': { icon: 'text-gray-500', badge: 'bg-gray-50 text-gray-500' }
  }
  return colors[status.value]
})
</script> 