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
            <h1 class="text-3xl font-bold text-text-primary">{{ t.about.title }}</h1>
            <p class="text-text-secondary mt-2">
              {{ t.about.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <main>
      <!-- Story Section -->
      <section class="py-16 px-6">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Heart class="h-8 w-8 text-primary" />
          </div>
          <h2 class="text-2xl font-bold mb-4 text-text-primary">{{ t.about.story.title }}</h2>
          <p class="text-text-secondary leading-relaxed">
            {{ t.about.story.description }}
          </p>
        </div>
      </section>

      <!-- AI Development Section -->
      <section class="py-16 px-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Sparkles class="h-8 w-8 text-primary" />
          </div>
          <h2 class="text-2xl font-bold mb-4 text-text-primary">{{ t.about.ai.title }}</h2>
          <p class="text-text-secondary leading-relaxed">
            {{ t.about.ai.description }}
          </p>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-16 px-6 bg-white border-y border-gray-200/50">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              v-for="stat in stats"
              :key="stat.label"
              class="text-center p-6 rounded-xl bg-gray-50 border border-gray-200/50"
            >
              <div class="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <component :is="stat.icon" class="h-6 w-6 text-primary" />
              </div>
              <div class="text-3xl font-bold text-text-primary mb-2">{{ stat.value }}</div>
              <div class="font-medium text-text-primary mb-1">{{ stat.label }}</div>
              <p class="text-sm text-text-secondary">{{ stat.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-2xl font-bold text-center mb-12 text-text-primary">{{ t.about.values.title }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              v-for="value in t.about.values.list"
              :key="value.title"
              class="p-6 bg-white rounded-xl border border-gray-200/50 hover:shadow-lg transition-all"
            >
              <h3 class="text-lg font-semibold mb-2 text-text-primary">{{ value.title }}</h3>
              <p class="text-text-secondary">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-2xl font-bold mb-4">{{ t.about.cta.title }}</h2>
          <p class="mb-8 text-white/80">
            {{ t.about.cta.description }}
          </p>
          <router-link
            :to="ctaLink"
            class="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors group"
          >
            {{ t.about.cta.getStarted }}
            <ArrowLeft class="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Heart, Gift, Users, Globe, Sparkles } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const t = useTranslations()
const auth = useAuthStore()

const ctaLink = computed(() => auth.isAuthenticated ? '/wishlists' : '/login')

const stats = [
  {
    label: t.about.stats[0].label,
    value: t.about.stats[0].value,
    icon: Users,
    description: t.about.stats[0].description
  },
  {
    label: t.about.stats[1].label,
    value: t.about.stats[1].value,
    icon: Gift,
    description: t.about.stats[1].description
  },
  {
    label: t.about.stats[2].label,
    value: t.about.stats[2].value,
    icon: Globe,
    description: t.about.stats[2].description
  }
]
</script> 