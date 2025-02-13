<template>
  <NavbarSkeleton v-if="loading" />
  <header v-else class="px-6 py-4 border-b border-border bg-background">
    <nav class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <router-link 
          to="/"
          class="flex items-center space-x-2 text-xl font-semibold text-text-primary hover:text-primary transition-colors"
        >
          <div class="relative w-10 h-10">
            <img
              src="/icon.png"
              alt="WishWithMe Logo"
              class="object-contain w-10 h-10"
            />
          </div>
          <span>WishWithMe</span>
        </router-link>
        <span class="text-sm text-text-secondary hidden sm:inline">
          {{ t.common.motto }}
        </span>
      </div>

      <div class="flex items-center space-x-4">
        <template v-if="!user">
          <router-link 
            to="/login" 
            class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ t.common.signIn }}
          </router-link>
        </template>
        <template v-else>
          <div class="flex items-center space-x-4">
            <div class="relative" ref="dropdownRef">
              <button
                @click="showDropdown = !showDropdown"
                class="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                <User class="h-5 w-5" />
                <span class="text-sm font-medium">{{ user.name }}</span>
              </button>

              <div v-if="showDropdown" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border z-50">
                <div class="py-1">
                  <router-link
                    to="/wishlists"
                    @click="showDropdown = false"
                    class="block px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors flex items-center whitespace-nowrap"
                  >
                    <Gift class="h-4 w-4 mr-3 flex-shrink-0" />
                    {{ t.common.myWishlists }}
                  </router-link>
                  <router-link
                    to="/profile"
                    @click="showDropdown = false"
                    class="block px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors flex items-center whitespace-nowrap"
                  >
                    <Settings class="h-4 w-4 mr-3 flex-shrink-0" />
                    {{ t.common.profileSettings }}
                  </router-link>
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-5 py-2.5 text-sm text-error hover:bg-gray-100 transition-colors flex items-center cursor-pointer whitespace-nowrap"
                  >
                    <LogOut class="h-4 w-4 mr-3 flex-shrink-0" />
                    {{ t.common.signOut }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </header>

  <SuccessToast
    v-if="showSuccessToast"
    :message="t.common.signedOut"
    @close="showSuccessToast = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { User, LogOut, Gift, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import SuccessToast from './SuccessToast.vue'
import NavbarSkeleton from './NavbarSkeleton.vue'
import { useTranslations } from '@/composables/useTranslations'
import { useRouter } from 'vue-router'

const showDropdown = ref(false)
const showSuccessToast = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)
const auth = useAuthStore()
const { user, loading } = storeToRefs(auth)
const router = useRouter()
const t = useTranslations()

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const handleLogout = async () => {
  try {
    await auth.logout()
    showSuccessToast.value = true
    router.push('/login')
  } catch (err) {
    console.error('Failed to logout:', err)
  }
  showDropdown.value = false
}
</script> 