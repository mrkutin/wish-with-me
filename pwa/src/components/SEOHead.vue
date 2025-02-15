<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useTranslations } from '@/composables/useTranslations'
import { defaultMeta } from '../config/meta'

const props = defineProps<{
  title?: string
  description?: string
  keywords?: string
  image?: string
  noindex?: boolean
}>()

const route = useRoute()
const t = useTranslations()

const meta = computed(() => ({
  title: String(props.title || t.meta.defaultTitle),
  description: String(props.description || t.meta.defaultDescription),
  keywords: String(props.keywords || t.meta.defaultKeywords),
  image: String(props.image || defaultMeta.ogImage),
  url: `https://wishwith.me${route.path}`,
  locale: String(route.params.lang || 'en')
}))

useHead({
  title: () => meta.value.title,
  meta: [
    { name: 'description', content: () => meta.value.description },
    { name: 'keywords', content: () => meta.value.keywords },
    { property: 'og:locale', content: () => meta.value.locale },
    { property: 'og:title', content: () => meta.value.title },
    { property: 'og:description', content: () => meta.value.description },
    { property: 'og:image', content: () => meta.value.image },
    { property: 'og:url', content: () => meta.value.url },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: defaultMeta.twitterCard },
    { name: 'twitter:title', content: () => meta.value.title },
    { name: 'twitter:description', content: () => meta.value.description },
    { name: 'twitter:image', content: () => meta.value.image },
    { name: 'theme-color', content: defaultMeta.themeColor },
    { name: 'robots', content: () => props.noindex ? 'noindex,nofollow' : 'index,follow' }
  ],
  link: [
    { rel: 'canonical', href: () => meta.value.url },
    { rel: 'alternate', hreflang: 'en', href: () => `https://wishwith.me${route.path}` },
    { rel: 'alternate', hreflang: 'ru', href: () => `https://wishwith.me/ru${route.path}` },
    { rel: 'alternate', hreflang: 'x-default', href: () => `https://wishwith.me${route.path}` }
  ]
})
</script> 