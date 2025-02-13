import { defineStore } from 'pinia'

interface User {
  id?: string
  _id?: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string
}

export const useAuthStore = defineStore({
  id: 'auth',
  
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: true,
    error: ''
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.token && !!this.user
    }
  },

  actions: {
    updateUser(userData: User) {
      this.user = userData
      this.saveToStorage()
    },

    async initialize() {
      this.loading = true
      const savedAuth = localStorage.getItem('auth')
      
      if (savedAuth) {
        try {
          const { token, user } = JSON.parse(savedAuth)
          
          if (token && user) {
            await this.$patch({
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            })
            
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (res.ok) {
              const data = await res.json()
              if (data && data._id) {
                this.user = {
                  id: data._id,
                  name: data.name,
                  email: data.email
                }
                this.saveToStorage()
              } else {
                this.clearAuth()
              }
            } else {
              this.clearAuth()
            }
          } else {
            this.clearAuth()
          }
        } catch (err) {
          this.clearAuth()
        }
      }
      
      this.loading = false
    },

    async login(token: string, userData: User) {
      // Handle both _id and id fields from API
      const userId = userData._id || userData.id
      if (!userId) {
        throw new Error('Invalid user data: no ID found')
      }

      const user = {
        id: userId,
        name: userData.name,
        email: userData.email
      }

      await this.$patch({
        token,
        user
      })

      this.saveToStorage()
    },
    
    async logout() {
      this.clearAuth()
    },
    
    async checkAuth() {
      if (!this.token) {
        return
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          this.user = data.user
          this.saveToStorage()
        } else {
          this.clearAuth()
        }
      } catch {
        this.clearAuth()
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth')
    },

    saveToStorage() {
      const authData = {
        token: this.token,
        user: this.user
      }
      localStorage.setItem('auth', JSON.stringify(authData))
    }
  }
}) 