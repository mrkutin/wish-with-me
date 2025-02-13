import { defineStore } from 'pinia'

export const useWishlistsStore = defineStore('wishlists', {
  state: () => ({
    wishlists: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchWishlists() {
      // Fetch wishlists logic
    },
    
    async createWishlist(_data: unknown) {
      // Create wishlist logic
    }
  }
}) 