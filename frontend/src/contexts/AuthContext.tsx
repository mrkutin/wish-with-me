'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface User {
  _id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (token: string, userData: User) => void
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const token = Cookies.get('token')
      const savedUser = Cookies.get('user')
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (error: unknown) {
          console.error('Failed to parse saved user data:', error)
          handleAuthError('Invalid session data')
        }
      }
    } catch (error: unknown) {
      console.error('Failed to access cookies:', error)
      handleAuthError('Failed to access cookies')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleAuthError(message: string) {
    setError(message)
    Cookies.remove('token')
    Cookies.remove('user')
    setUser(null)
  }

  function clearError() {
    setError(null)
  }

  function login(token: string, userData: User) {
    try {
      Cookies.set('token', token, { 
        secure: true, 
        sameSite: 'strict',
        expires: 7 // Cookie expires in 7 days
      })
      Cookies.set('user', JSON.stringify(userData), { 
        secure: true, 
        sameSite: 'strict',
        expires: 7
      })
      setUser(userData)
      clearError()
      router.push('/wishlists')
    } catch (error: unknown) {
      console.error('Login error:', error)
      handleAuthError('Failed to set authentication data')
    }
  }

  async function logout() {
    try {
      const token = Cookies.get('token')
      
      // Call logout endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to logout')
      }

      // Clear cookies and state
      Cookies.remove('token')
      Cookies.remove('user')
      setUser(null)
      clearError()
      
      // Redirect to home page
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if the API call fails, clear local state
      Cookies.remove('token')
      Cookies.remove('user')
      setUser(null)
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 