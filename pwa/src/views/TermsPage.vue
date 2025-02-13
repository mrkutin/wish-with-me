<template>
  <div class="min-h-screen bg-background-alt">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex flex-col space-y-4">
          <router-link 
            to="/"
            class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mb-8 group"
          >
            <ArrowLeft class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {{ t.common.back }}
          </router-link>

          <div>
            <h1 class="text-3xl font-bold text-text-primary">{{ t.terms.title }}</h1>
            <p class="mt-2 text-text-secondary">
              {{ t.terms.lastUpdated }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-4xl mx-auto px-6 py-12">
      <div class="bg-white rounded-xl border border-gray-200/50 overflow-hidden">
        <div class="p-8">
          <p class="text-text-secondary mb-8">
            {{ t.terms.intro }}
          </p>

          <div 
            v-for="(section, index) in t.terms.sections"
            :key="section.title"
            :class="{ 'mb-8': index !== t.terms.sections.length - 1 }"
          >
            <h2 class="text-lg font-semibold mb-3 text-text-primary">
              {{ section.title }}
            </h2>
            <p class="text-text-secondary leading-relaxed">
              {{ section.content }}
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mt-12 text-center">
        <p class="text-text-secondary">
          {{ t.terms.questions.title }}
          <router-link 
            to="/contact" 
            class="text-primary hover:text-primary/80 transition-colors"
          >
            {{ t.terms.questions.contactUs }}
          </router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const t = useTranslations()
</script> 