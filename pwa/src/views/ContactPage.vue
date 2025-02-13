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
            <h1 class="text-3xl font-bold text-text-primary">{{ t.contact.title }}</h1>
            <p class="text-text-secondary mt-2">
              {{ t.contact.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-xl border border-gray-200/50 p-8">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-primary/10 rounded-lg">
              <MessageSquare class="h-6 w-6 text-primary" />
            </div>
            <h2 class="text-xl font-semibold text-text-primary">{{ t.contact.form.title }}</h2>
          </div>

          <form class="space-y-6" @submit.prevent>
            <div class="space-y-2">
              <label for="name" class="block text-sm font-medium text-text-primary">
                {{ t.contact.form.name }}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autocomplete="name"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                :placeholder="t.contact.form.namePlaceholder"
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-text-primary">
                {{ t.contact.form.email }}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autocomplete="email"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                :placeholder="t.contact.form.emailPlaceholder"
              />
            </div>

            <div class="space-y-2">
              <label for="subject" class="block text-sm font-medium text-text-primary">
                {{ t.contact.form.subject }}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                autocomplete="off"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                :placeholder="t.contact.form.subjectPlaceholder"
              />
            </div>

            <div class="space-y-2">
              <label for="message" class="block text-sm font-medium text-text-primary">
                {{ t.contact.form.message }}
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                autocomplete="off"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                :placeholder="t.contact.form.messagePlaceholder"
              />
            </div>

            <button
              type="submit"
              class="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {{ t.contact.form.send }}
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Methods -->
          <div>
            <a
              v-for="method in contactMethods"
              :key="method.title"
              :href="method.action"
              class="bg-white rounded-xl border border-gray-200/50 p-6 hover:shadow-lg transition-all group block"
            >
              <div class="flex items-start space-x-4">
                <div class="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <component :is="method.icon" class="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold text-text-primary mb-1">{{ method.title }}</h3>
                  <p class="text-sm text-text-secondary mb-2">{{ method.description }}</p>
                  <p class="text-primary font-medium">{{ method.value }}</p>
                </div>
              </div>
            </a>
          </div>

          <!-- Office Details -->
          <div class="bg-white rounded-xl border border-gray-200/50 p-6">
            <h3 class="font-semibold text-text-primary mb-4">{{ t.contact.office.title }}</h3>
            <div class="space-y-4">
              <div v-for="detail in officeDetails" :key="detail.label" class="flex items-center space-x-3">
                <div class="p-2 bg-primary/10 rounded-lg">
                  <component :is="detail.icon" class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="text-sm text-text-secondary">{{ detail.label }}</p>
                  <p class="font-medium text-text-primary">{{ detail.value }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Link -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 class="font-semibold mb-2">{{ t.contact.faq.title }}</h3>
            <p class="text-white/80 mb-4">
              {{ t.contact.faq.description }}
            </p>
            <router-link
              to="/faq"
              class="inline-flex items-center text-sm font-medium hover:text-white/90 transition-colors group"
            >
              {{ t.contact.faq.link }}
              <ArrowLeft class="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Mail, MessageSquare, MapPin, Clock } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const t = useTranslations()

const contactMethods = [
  {
    icon: Mail,
    title: t.contact.email.title,
    description: t.contact.email.description,
    value: t.contact.email.value,
    action: `mailto:${t.contact.email.value}`
  }
]

const officeDetails = [
  {
    icon: MapPin,
    label: t.contact.office.location,
    value: t.contact.office.locationValue
  },
  {
    icon: Clock,
    label: t.contact.office.hours,
    value: t.contact.office.hoursValue
  }
]
</script> 