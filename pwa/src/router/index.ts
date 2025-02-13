import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '../views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupPage.vue')
    },
    {
      path: '/wishlists',
      name: 'wishlists',
      component: () => import('../views/WishlistsPage.vue'),
      meta: { requiresAuth: true }  // Optional: for auth protection
    },
    {
      path: '/wishlists/follow/:token',
      name: 'wishlist-follow',
      component: () => import('../views/WishlistFollowPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wishlists/:id',
      name: 'wishlist-detail',
      component: () => import('../views/WishlistDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactPage.vue')
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('../views/CallbackPage.vue')
    },
    {
      path: '/features',
      name: 'features',
      component: () => import('../views/FeaturesPage.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQPage.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutPage.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPage.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/TermsPage.vue')
    }
  ]
})

let authInitialized = false

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  
  if (!authInitialized) {
    await auth.initialize()
    authInitialized = true
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    if (to.path !== '/login') {
      localStorage.setItem('loginReturnUrl', to.fullPath)
    }
    next('/login')
  } else {
    next()
  }
})

export default router 