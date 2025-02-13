<template>
  <PageLayout>
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col space-y-4">
          <router-link 
            to="/wishlists"
            class="inline-flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {{ t.profile.backToWishlists }}
          </router-link>

          <div class="flex items-center space-x-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <UserCircle class="h-6 w-6 text-primary" />
            </div>
            <h1 class="text-2xl font-semibold text-text-primary">{{ t.profile.title }}</h1>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <!-- Profile Settings Card -->
      <div class="bg-white rounded-xl border border-gray-200/50 overflow-hidden">
        <div class="p-6 sm:p-8">
          <div class="space-y-8">
            <!-- Personal Information Section -->
            <div>
              <h2 class="text-lg font-medium text-text-primary flex items-center">
                <User class="h-5 w-5 mr-2 text-primary/60" />
                {{ t.profile.personalInfo.title }}
              </h2>
              <p class="mt-1 text-sm text-text-secondary">
                {{ t.profile.personalInfo.description }}
              </p>

              <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
                <div class="space-y-4">
                  <div>
                    <label for="name" class="block text-sm font-medium text-text-primary">
                      {{ t.profile.personalInfo.fullName }}
                    </label>
                    <div class="relative mt-1">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User class="h-5 w-5 text-text-secondary" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        autocomplete="name"
                        v-model="formData.name"
                        class="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="email" class="block text-sm font-medium text-text-primary">
                      {{ t.profile.personalInfo.emailAddress }}
                    </label>
                    <div class="relative mt-1">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail class="h-5 w-5 text-text-secondary" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autocomplete="email"
                        v-model="formData.email"
                        class="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Password Section -->
            <div class="pt-6 border-t border-gray-200/50">
              <h2 class="text-lg font-medium text-text-primary flex items-center">
                <Key class="h-5 w-5 mr-2 text-primary/60" />
                {{ t.profile.password.title }}
              </h2>
              <p class="mt-1 text-sm text-text-secondary">
                {{ t.profile.password.description }}
              </p>

              <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
                <input
                  type="text"
                  id="username"
                  name="username"
                  autocomplete="username"
                  :value="auth.user?.email || ''"
                  style="display: none"
                  aria-hidden="true"
                  readonly
                />
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-text-primary">
                    {{ t.profile.password.current }}
                  </label>
                  <div class="relative mt-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key class="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      autocomplete="current-password"
                      v-model="formData.currentPassword"
                      class="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label for="newPassword" class="block text-sm font-medium text-text-primary">
                    {{ t.profile.password.new }}
                  </label>
                  <div class="relative mt-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key class="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      autocomplete="new-password"
                      v-model="formData.newPassword"
                      class="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background-alt text-text-primary"
                    />
                  </div>
                </div>
              </form>
            </div>

            <!-- Save Button -->
            <div class="pt-6 border-t border-gray-200/50">
              <div class="flex justify-end">
                <button
                  @click="handleSubmit"
                  :disabled="isUpdating"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors inline-flex items-center"
                >
                  <Loader2 v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {{ isUpdating ? t.profile.actions.saving : t.profile.actions.save }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Account Card -->
      <div class="bg-white rounded-xl border border-red-200/50 overflow-hidden">
        <div class="p-6 sm:p-8">
          <h2 class="text-lg font-medium text-red-600 flex items-center">
            <AlertTriangle class="h-5 w-5 mr-2 text-red-500/60" />
            {{ t.profile.deleteAccount.title }}
          </h2>
          <p class="mt-1 text-sm text-text-secondary">
            {{ t.profile.deleteAccount.description }}
          </p>

          <div class="mt-6 flex justify-end">
            <template v-if="!showDeleteConfirm">
              <button
                @click="showDeleteConfirm = true"
                class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {{ t.profile.deleteAccount.button }}
              </button>
            </template>
            <template v-else>
              <div class="space-y-4 w-full">
                <div class="p-4 bg-red-50 rounded-lg">
                  <p class="text-sm text-red-600 font-medium">
                    {{ t.profile.deleteAccount.confirm.title }}
                  </p>
                  <ul class="mt-2 text-sm text-red-500 list-disc list-inside">
                    <li v-for="(consequence, index) in t.profile.deleteAccount.confirm.consequences" :key="index">
                      {{ consequence }}
                    </li>
                  </ul>
                </div>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="showDeleteConfirm = false"
                    class="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                  >
                    {{ t.profile.deleteAccount.confirm.cancel }}
                  </button>
                  <button
                    @click="handleDeleteAccount"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    {{ t.profile.deleteAccount.confirm.confirm }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>

    <SuccessToast
      v-if="successMessage"
      :message="successMessage"
      @close="successMessage = ''"
    />

    <ErrorToast
      v-if="errorMessage"
      :message="errorMessage"
      @close="errorMessage = ''"
    />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, User, Mail, Key, UserCircle, AlertTriangle, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTranslations } from '@/composables/useTranslations'
import PageLayout from '@/components/PageLayout.vue'
import SuccessToast from '@/components/SuccessToast.vue'
import ErrorToast from '@/components/ErrorToast.vue'

const router = useRouter()
const auth = useAuthStore()
const t = useTranslations()

const isUpdating = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showDeleteConfirm = ref(false)

const formData = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  currentPassword: '',
  newPassword: ''
})

// Update form data when user data changes
onMounted(() => {
  if (!auth.user) {
    router.push('/login')
    return
  }

  formData.value.name = auth.user.name
  formData.value.email = auth.user.email
})

async function handleSubmit() {
  if (!auth.user) return

  isUpdating.value = true
  errorMessage.value = ''

  try {
    const updateData: any = {}

    // Only include fields that have been changed
    if (formData.value.name !== auth.user.name) updateData.name = formData.value.name
    if (formData.value.email !== auth.user.email) updateData.email = formData.value.email
    if (formData.value.newPassword) {
      updateData.currentPassword = formData.value.currentPassword
      updateData.newPassword = formData.value.newPassword
    }

    // Don't make API call if nothing has changed
    if (Object.keys(updateData).length === 0) {
      successMessage.value = t.profile.actions.noChanges
      return
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(updateData)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || t.profile.messages.updateError)
    }

    const updatedUserData = await res.json()
    
    // Update the user data in AuthStore
    auth.updateUser({
      ...auth.user,
      name: updatedUserData.name,
      email: updatedUserData.email
    })

    successMessage.value = t.profile.messages.updateSuccess
    
    // Reset password fields
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.name = updatedUserData.name
    formData.value.email = updatedUserData.email
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t.profile.messages.updateError
  } finally {
    isUpdating.value = false
  }
}

async function handleDeleteAccount() {
  try {
    if (!auth.user?.id) {
      throw new Error('User ID not found')
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${auth.user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || t.profile.messages.deleteError)
    }

    await auth.logout()
    router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t.profile.messages.deleteError
  }
}
</script> 