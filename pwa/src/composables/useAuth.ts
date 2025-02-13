import { ref, onMounted } from 'vue'

interface User {
  id: string
  name: string
  email: string
}

export function useAuth() {
  // Initialize user from localStorage if exists
  const storedUser = localStorage.getItem('user')
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null)
  const loading = ref(true)
  const error = ref('')

  async function checkAuth() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          user.value = data.user
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          user.value = null
        }
      } catch (err) {
        console.error('Failed to check auth:', err)
      }
    }
    loading.value = false
  }

  async function login(token: string, userData: User) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    user.value = userData
  }

  async function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
  }

  function clearError() {
    error.value = ''
  }

  // Check auth status when composable is used
  onMounted(() => {
    checkAuth()
  })

  return {
    user,
    loading,
    error,
    login,
    logout,
    clearError
  }
} 