<template>
  <PageLayout>
    <div class="flex-1 flex flex-col justify-center px-6 py-12">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <router-link 
          to="/"
          class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark mb-8 group"
        >
          <ArrowLeft class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {{ t.common.back }}
        </router-link>

        <h1 class="text-2xl font-semibold text-text-primary">
          {{ t.auth.createAccount }}
        </h1>
        <p class="mt-2 text-sm text-text-secondary">
          {{ t.auth.alreadyHaveAccount }}
          <router-link 
            :to="`/login${returnUrlParam}`"
            class="inline-flex items-center font-semibold text-primary hover:text-primary-dark group"
          >
            {{ t.auth.signIn }}
            <ArrowLeft class="ml-1 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-background-card py-8 px-6 shadow-sm rounded-lg border border-border sm:px-10">
          <!-- Social Login Buttons -->
          <div class="mb-6">
            <h3 class="text-sm text-text-secondary text-center mb-4">
              {{ t.auth.continueWith }}
            </h3>
            <div class="space-y-3">
              <button
                type="button"
                @click="handleGoogleSignup"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <GoogleLogo />
                Google
              </button>
              <button
                type="button"
                @click="handleYandexSignup"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <YandexLogo />
                Yandex
              </button>
              <button
                type="button"
                @click="handleVKSignup"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <VKLogo />
                VK
              </button>
            </div>
          </div>

          <!-- Or Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-background-card text-text-secondary">
                {{ t.auth.or }}
              </span>
            </div>
          </div>

          <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
            <div v-if="error" class="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
              {{ error }}
            </div>
            
            <div>
              <label 
                for="name" 
                class="block text-sm font-medium text-text-primary"
              >
                {{ t.auth.fullName }}
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                autocomplete="name"
                class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label 
                for="email" 
                class="block text-sm font-medium text-text-primary"
              >
                {{ t.auth.emailAddress }}
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                autocomplete="email"
                class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-text-primary"
              >
                {{ t.auth.password }}
              </label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-text-primary"
              >
                {{ t.auth.confirmPassword }}
              </label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div class="flex items-center">
              <input
                id="terms"
                v-model="acceptedTerms"
                type="checkbox"
                required
                class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label for="terms" class="ml-2 block text-sm text-text-secondary">
                {{ t.auth.agreeToTerms }}
                <router-link to="/terms" class="text-primary hover:text-primary-dark">
                  {{ t.auth.termsOfService }}
                </router-link>
                {{ t.common.and }}
                <router-link to="/privacy" class="text-primary hover:text-primary-dark">
                  {{ t.auth.privacyPolicy }}
                </router-link>
              </label>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? t.auth.creatingAccount : t.auth.createAccount }}
            </button>
          </form>

          <div class="mt-6 relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-background-card text-text-secondary">
                {{ t.auth.alreadyHaveAccount }}
              </span>
            </div>
          </div>

          <div class="mt-6 relative">
            <router-link 
              :to="`/login${returnUrlParam}`"
              class="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md shadow-sm text-sm font-medium text-text-primary bg-background border border-border hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {{ t.auth.signIn }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTranslations } from '@/composables/useTranslations'
import GoogleLogo from '@/components/GoogleLogo.vue'
import YandexLogo from '@/components/YandexLogo.vue'
import VKLogo from '@/components/VKLogo.vue'
import PageLayout from '@/components/PageLayout.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const t = useTranslations()

const isLoading = ref(false)
const error = ref('')
const acceptedTerms = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const returnUrlParam = computed(() => {
  const returnUrl = route.query.returnUrl
  return returnUrl ? `?returnUrl=${returnUrl}` : ''
})

async function onSubmit() {
  error.value = ''

  // Validate passwords match
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = t.auth.passwordsDoNotMatch
    return
  }

  isLoading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || t.auth.failedToSignUp)
    }

    await auth.login(data.token, data.user)
    
    const returnUrl = route.query.returnUrl?.toString() || '/wishlists'
    router.push(returnUrl)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t.auth.failedToCreateAccount
  } finally {
    isLoading.value = false
  }
}

function handleGoogleSignup() {
  try {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  } catch {
    error.value = t.auth.failedGoogleSignup
  }
}

function handleYandexSignup() {
  try {
    const callbackUrl = `${window.location.origin}/callback`
    const yandexAuthUrl = `${import.meta.env.VITE_API_URL}/auth/yandex?callbackUrl=${encodeURIComponent(callbackUrl)}`
    window.location.href = yandexAuthUrl
  } catch {
    error.value = t.auth.failedYandexLogin
  }
}

function handleVKSignup() {
  try {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/vk`
  } catch {
    error.value = t.auth.failedVKLogin
  }
}
</script> 