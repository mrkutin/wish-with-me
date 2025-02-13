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
            <h1 class="text-3xl font-bold text-text-primary">{{ t.faq.title }}</h1>
            <p class="mt-2 text-text-secondary">
              {{ t.faq.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-4xl mx-auto px-6 py-12">
      <!-- Category Filter -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4 text-text-primary">{{ t.faq.filterByCategory }}</h2>
        <div class="flex space-x-2">
          <button
            v-for="[category] in Object.entries(faqsByCategory)"
            :key="category"
            @click="activeCategory = category as CategoryType"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeCategory === category
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- FAQ Items -->
      <div
        v-for="(faq, index) in faqsByCategory[activeCategory]"
        :key="faq.question"
        class="bg-white rounded-xl border border-gray-200/50 overflow-hidden hover:border-primary/30 transition-colors"
      >
        <button
          @click="toggleItem(index)"
          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors group"
        >
          <span :class="[
            'font-medium transition-colors',
            openItems.includes(index) ? 'text-primary' : 'text-text-primary group-hover:text-primary'
          ]">
            {{ faq.question }}
          </span>
          <ChevronDown 
            :class="[
              'h-5 w-5 text-text-secondary transition-transform duration-300',
              openItems.includes(index) ? 'rotate-180 text-primary' : 'group-hover:text-primary'
            ]"
          />
        </button>
        <div 
          :class="[
            'grid transition-all duration-300 ease-in-out',
            openItems.includes(index) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          ]"
        >
          <div class="overflow-hidden">
            <div class="px-6 pb-4 pt-2 text-text-secondary">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mt-12 p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white text-center">
        <h2 class="text-2xl font-bold mb-4">{{ t.faq.stillHaveQuestions.title }}</h2>
        <p class="mb-6 text-white/80">
          {{ t.faq.stillHaveQuestions.subtitle }}
        </p>
        <router-link
          to="/contact"
          class="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          {{ t.faq.stillHaveQuestions.contactSupport }}
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, ChevronDown } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const t = useTranslations()
const openItems = ref<number[]>([])
type CategoryType = keyof typeof t.faq.categories
const activeCategory = ref<CategoryType>('gettingStarted')

const faqs: FAQItem[] = [
  // Getting Started
  ...t.faq.questions.gettingStarted.map(q => ({
    ...q,
    category: t.faq.categories.gettingStarted
  })),
  // Managing Wishlists
  ...t.faq.questions.managingWishlists.map(q => ({
    ...q,
    category: t.faq.categories.managingWishlists
  })),
  // Sharing & Privacy
  ...t.faq.questions.sharingAndPrivacy.map(q => ({
    ...q,
    category: t.faq.categories.sharingAndPrivacy
  })),
  // Account & Settings
  ...t.faq.questions.accountAndSettings.map(q => ({
    ...q,
    category: t.faq.categories.accountAndSettings
  }))
]

const faqsByCategory = computed(() => {
  return faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQItem[]>)
})

function toggleItem(index: number) {
  openItems.value = openItems.value.includes(index)
    ? openItems.value.filter(i => i !== index)
    : [...openItems.value, index]
}
</script> 