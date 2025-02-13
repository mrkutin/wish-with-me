<template>
  <SuccessToast
    v-if="showSuccessToast"
    :message="t.auth.loginSuccess"
    @close="showSuccessToast = false"
  />
  <LoadingSpinner v-if="loading" />
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
          {{ t.auth.welcomeBack }}
        </h1>
        <p class="mt-2 text-sm text-text-secondary">
          {{ t.auth.dontHaveAccount }}
          <router-link 
            :to="`/signup${returnUrlParam}`"
            class="inline-flex items-center font-semibold text-primary hover:text-primary-dark group"
          >
            {{ t.auth.signup }} 
            <ArrowLeft class="ml-1 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-background-card py-8 px-6 shadow-sm rounded-lg border border-border sm:px-10">
          <div class="mb-6">
            <h3 class="text-sm text-text-secondary text-center mb-4">
              {{ t.auth.continueWith }}
            </h3>
            <div class="space-y-3">
              <button
                type="button"
                @click="handleGoogleLogin"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <GoogleLogo />
                Google
              </button>
              <button
                type="button"
                @click="handleYandexLogin"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <YandexLogo />
                Yandex
              </button>
              <button
                type="button"
                @click="handleVKLogin"
                class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <VKLogo />
                VK
              </button>
            </div>
          </div>

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
            <div v-if="loginError" class="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
              {{ loginError }}
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
                type="email"
                v-model="email"
                required
                autocomplete="username"
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
                type="password"
                v-model="password"
                required
                autocomplete="current-password"
                class="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  v-model="rememberMe"
                  class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label for="remember-me" class="ml-2 block text-sm text-text-secondary">
                  {{ t.auth.rememberMe }}
                </label>
              </div>

              <router-link
                to="/forgot-password"
                class="text-sm font-medium text-primary hover:text-primary-dark"
              >
                {{ t.auth.forgotPassword }}
              </router-link>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? t.auth.signingIn : t.auth.signIn }}
            </button>
          </form>




          <div class="mt-6 relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-background-card text-text-secondary">
                {{ t.auth.dontHaveAccount }}
              </span>
            </div>
          </div>

          <div class="mt-6 relative">
            <div class="mt-4">
              <router-link 
                :to="`/signup${returnUrlParam}`"
                class="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md shadow-sm text-sm font-medium text-text-primary bg-background border border-border hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                {{ t.auth.createAccount }}
              </router-link>
            </div>
          </div>

        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTranslations } from '@/composables/useTranslations'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import GoogleLogo from '@/components/GoogleLogo.vue'
import YandexLogo from '@/components/YandexLogo.vue'
import VKLogo from '@/components/VKLogo.vue'
import SuccessToast from '@/components/SuccessToast.vue'
import PageLayout from '@/components/PageLayout.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { user, loading } = storeToRefs(auth)
const t = useTranslations()

const isLoading = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loginError = ref('')
const showSuccessToast = ref(false)

const returnUrlParam = computed(() => {
  const returnUrl = route.query.returnUrl
  return returnUrl ? `?returnUrl=${returnUrl}` : ''
})

onMounted(() => {
  // Redirect if already logged in
  if (user.value) {
    const returnUrl = route.query.returnUrl?.toString() || '/wishlists'
    router.push(returnUrl)
  }
})

async function onSubmit() {
  loginError.value = ''
  isLoading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.value, 
        password: password.value 
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to login')
    }

    await auth.login(data.token, data.user)
    
    const savedReturnUrl = localStorage.getItem('loginReturnUrl')
    localStorage.removeItem('loginReturnUrl')
    
    if (savedReturnUrl) {
      router.push(savedReturnUrl)
    } else {
      router.push('/wishlists')
    }
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : t.auth.invalidCredentials
  } finally {
    isLoading.value = false
  }
}

function handleGoogleLogin() {
  try {
    const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`
    window.location.href = googleAuthUrl
  } catch {
    loginError.value = t.auth.failedGoogleLogin
  }
}

function handleYandexLogin() {
  try {
    const yandexAuthUrl = `${import.meta.env.VITE_API_URL}/auth/yandex`
    window.location.href = yandexAuthUrl
  } catch {
    loginError.value = t.auth.failedYandexLogin
  }
}

function handleVKLogin() {
  try {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/vk`
  } catch {
    loginError.value = t.auth.failedVKLogin
  }
}
</script> 