<template>
  <div class="min-h-screen bg-background-alt">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col space-y-4">
          <router-link 
            to="/"
            class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mb-8 group"
          >
            <ArrowLeft class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {{ t.common.back }}
          </router-link>

          <div>
            <h1 class="text-3xl font-bold text-text-primary">{{ t.features.title }}</h1>
            <p class="mt-2 text-text-secondary max-w-2xl">
              {{ t.features.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="feature in features"
          :key="feature.title"
          class="bg-white rounded-xl border border-gray-200/50 p-6 hover:shadow-lg transition-all group"
        >
          <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <component :is="feature.icon" class="h-6 w-6 text-primary" />
          </div>
          <h3 class="text-lg font-semibold mb-2 text-text-primary">{{ feature.title }}</h3>
          <p class="text-text-secondary">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="mt-16 text-center">
        <router-link
          :to="ctaLink"
          class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors group"
        >
          {{ t.features.getStarted }}
          <ArrowLeft class="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Gift, Share2, Bell, ShoppingCart, Calendar, Lock } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const t = useTranslations()
const auth = useAuthStore()

const features = [
  {
    title: t.features.list[0].title,
    description: t.features.list[0].description,
    icon: Gift
  },
  {
    title: t.features.list[1].title,
    description: t.features.list[1].description,
    icon: Share2
  },
  {
    title: t.features.list[2].title,
    description: t.features.list[2].description,
    icon: Bell
  },
  {
    title: t.features.list[3].title,
    description: t.features.list[3].description,
    icon: ShoppingCart
  },
  {
    title: t.features.list[4].title,
    description: t.features.list[4].description,
    icon: Calendar
  },
  {
    title: t.features.list[5].title,
    description: t.features.list[5].description,
    icon: Lock
  }
]

const ctaLink = computed(() => auth.isAuthenticated ? '/wishlists' : '/login')
</script> 