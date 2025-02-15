import { createApp } from 'vue'
import { createHead } from '@unhead/vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Import fonts directly from node_modules
import '@fontsource/inter/files/inter-latin-400-normal.woff2'
import '@fontsource/inter/files/inter-latin-500-normal.woff2'
import '@fontsource/inter/files/inter-latin-600-normal.woff2'
import '@fontsource/inter/files/inter-latin-700-normal.woff2'
import '@fontsource/inter/files/inter-cyrillic-400-normal.woff2'
import '@fontsource/inter/files/inter-cyrillic-500-normal.woff2'
import '@fontsource/inter/files/inter-cyrillic-600-normal.woff2'
import '@fontsource/inter/files/inter-cyrillic-700-normal.woff2'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const head = createHead()

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app') 