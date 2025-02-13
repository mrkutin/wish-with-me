<template>
  <footer class="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="text-center md:text-left">
          <router-link 
            to="/"
            class="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity justify-center md:justify-start"
          >
            <img 
              src="/icon_inversed.png" 
              alt="WishWithMe Logo" 
              class="w-10 h-10 object-contain"
            />
            <span class="text-white font-semibold text-xl">WishWithMe</span>
          </router-link>
          <p class="text-sm">{{ t.common.motto }}</p>
        </div>
        <div class="text-center md:text-left">
          <h4 class="font-medium mb-4">{{ t.footer.product.title }}</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/features" class="hover:text-white transition-colors">
                {{ t.footer.product.features }}
              </router-link>
            </li>
            <li>
              <router-link to="/faq" class="hover:text-white transition-colors">
                {{ t.footer.product.faq }}
              </router-link>
            </li>
          </ul>
        </div>
        <div class="text-center md:text-left">
          <h4 class="font-medium mb-4">{{ t.footer.company.title }}</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/about" class="hover:text-white transition-colors">
                {{ t.footer.company.about }}
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="hover:text-white transition-colors">
                {{ t.footer.company.contact }}
              </router-link>
            </li>
          </ul>
        </div>
        <div class="text-center md:text-left">
          <h4 class="font-medium mb-4">{{ t.footer.legal.title }}</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/privacy" class="hover:text-white transition-colors">
                {{ t.footer.legal.privacy }}
              </router-link>
            </li>
            <li>
              <router-link to="/terms" class="hover:text-white transition-colors">
                {{ t.footer.legal.terms }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
        © {{ new Date().getFullYear() }} WishWithMe. {{ t.common.allRightsReserved }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const t = useTranslations()
</script> 