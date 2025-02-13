<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">{{ t.modals.shareWishlist.title }}</h3>
        <div class="space-y-4">
          <div class="flex justify-center">
            <QRCode 
              :value="shareUrl" 
              :size="200"
              :image-settings="{
                src: '/icon.png',
                height: 50,
                width: 50,
                excavate: true
              }"
              level="H"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              :value="shareUrl"
              readonly
              class="flex-1 px-3 py-2 border rounded-md bg-background-alt text-sm"
            />
            <button
              @click="handleCopy"
              class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              <Copy class="h-4 w-4" />
            </button>
          </div>
          <div class="flex justify-end">
            <button
              @click="onClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {{ t.modals.shareWishlist.actions.close }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SuccessToast
    v-if="copied"
    :message="t.modals.shareWishlist.copied"
    @close="copied = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy } from 'lucide-vue-next'
import QRCode from 'qrcode.vue'
import { useTranslations } from '@/composables/useTranslations'
import SuccessToast from './SuccessToast.vue'

const props = defineProps<{
  isOpen: boolean
  onClose: () => void
  sharedToken?: string
}>()

const t = useTranslations()
const copied = ref(false)
const shareUrl = computed(() => `${window.location.origin}/wishlists/follow/${props.sharedToken}`)

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script> 