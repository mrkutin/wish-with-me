export const defaultMeta = {
  ogImage: 'https://wishwith.me/og-image.png',
  twitterCard: 'summary_large_image',
  themeColor: '#2c3e50'
}

type MetaTranslations = typeof import('../translations/en').translations.meta

export const routes = {
  home: {
    titleKey: 'home' as keyof MetaTranslations,
    descriptionKey: 'home' as keyof MetaTranslations,
    keywordsKey: 'home' as keyof MetaTranslations
  },
  wishlists: {
    titleKey: 'wishlists' as keyof MetaTranslations,
    descriptionKey: 'wishlists' as keyof MetaTranslations,
    keywordsKey: 'wishlists' as keyof MetaTranslations
  },
  login: {
    titleKey: 'login' as keyof MetaTranslations,
    descriptionKey: 'login' as keyof MetaTranslations,
    keywordsKey: 'login' as keyof MetaTranslations
  },
  signup: {
    titleKey: 'signup' as keyof MetaTranslations,
    descriptionKey: 'signup' as keyof MetaTranslations,
    keywordsKey: 'signup' as keyof MetaTranslations
  }
} 