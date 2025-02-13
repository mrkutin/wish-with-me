<template>
  <div>
    <!-- Hero Section -->
    <section class="px-6 py-24 sm:py-32 relative isolate bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div class="absolute -z-10 right-5 top-10">
        <Heart class="h-24 w-24 text-white fill-white/5 rotate-12" />
      </div>
      <div class="absolute -z-10 left-10 bottom-10">
        <Gift class="h-16 w-16 text-white fill-white/5 -rotate-12" />
      </div>
      <div class="max-w-7xl mx-auto text-center">
        <div class="mb-8 flex items-center justify-center">
          <span class="inline-flex items-center gap-x-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
            <Star class="h-4 w-4 fill-white" />
            {{ t.home.hero.createFirstWishlist }}
          </span>
        </div>
        <h1 class="text-4xl sm:text-6xl font-bold tracking-tight">
          {{ t.home.hero.title }}
        </h1>
        <p class="mt-6 text-lg leading-8 max-w-2xl mx-auto text-white/80">
          {{ t.home.hero.subtitle }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <div v-if="loading" class="inline-flex items-center gap-2">
            <span>{{ t.common.loading }}</span>
          </div>
          <div v-else>
            <router-link
              :to="user ? '/wishlists' : '/login'"
              class="inline-flex items-center gap-2 rounded-lg bg-yellow-300 px-6 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 transition-colors group"
            >
              <Gift v-if="user && hasWishlists" class="h-4 w-4" />
              {{
                user
                ? (hasWishlists ? t.home.hero.myWishlists : t.home.hero.createFirstWishlist)
                : t.home.hero.createWishlist
              }}
              <ArrowRight class="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </router-link>
          </div>
          <router-link
            to="/about"
            class="inline-flex items-center text-sm font-medium leading-6 text-white/80 hover:text-yellow-300 transition-colors group"
          >
            {{ t.common.learnMore }}
            <ArrowRight class="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gray-50 px-6">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold tracking-tight text-center mb-4 text-gray-900">
          {{ t.home.features.title }}
        </h2>
        <p class="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          {{ t.home.features.subtitle }}
          <span class="text-blue-500 font-medium">{{ t.home.features.startFree }}</span>
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-500"
          >
            <div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
              <component 
                :is="feature.icon" 
                class="h-6 w-6 text-blue-500 group-hover:text-blue-600 transition-colors"
              />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900">{{ feature.title }}</h3>
            <p class="text-gray-500">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial section -->
    <section class="py-24 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-12">{{ t.home.testimonials.title }}</h2>
        <TestimonialSlider :testimonials="testimonials" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Star, Heart, Gift } from 'lucide-vue-next'
import TestimonialSlider from '../components/TestimonialSlider.vue'
import { useTranslations } from '@/composables/useTranslations'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const t = useTranslations()
const auth = useAuthStore()
const { user } = storeToRefs(auth)
const loading = ref(false)
const hasWishlists = ref(false)

interface Feature {
  title: string
  description: string
  icon: any
}

interface Testimonial {
  quote: string
  author: {
    name: string
    title: string
  }
}

const features: Feature[] = [
  {
    title: t.home.features.list.create.title,
    description: t.home.features.list.create.description,
    icon: Gift
  },
  {
    title: t.home.features.list.share.title,
    description: t.home.features.list.share.description,
    icon: Heart
  },
  {
    title: t.home.features.list.track.title,
    description: t.home.features.list.track.description,
    icon: Star
  }
]

// Convert readonly array to mutable array
const testimonials = [...t.home.testimonials.items] as Testimonial[]

onMounted(async () => {
  if (user.value) {
    loading.value = true
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlists`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        }
      })
      if (res.ok) {
        const wishlists = await res.json()
        hasWishlists.value = wishlists.length > 0
      }
    } catch (error) {
      console.error('Failed to fetch wishlists:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>

<style>
.home, .welcome-text {
  all: unset;
}
</style> 