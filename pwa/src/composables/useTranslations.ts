import { ref, computed } from 'vue'
import { translations as enTranslations } from '@/translations/en'
import { translations as ruTranslations } from '@/translations/ru'

type TranslationType = typeof enTranslations

export function useTranslations() {
  const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || 'en'
  const locale = ref(defaultLocale)
  
  return computed(() => 
    locale.value === 'ru' ? ruTranslations : enTranslations
  ).value as TranslationType
}