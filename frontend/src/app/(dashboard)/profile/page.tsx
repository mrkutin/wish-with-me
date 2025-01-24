'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Key, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import SuccessToast from '@/components/SuccessToast'
import ErrorToast from '@/components/ErrorToast'

interface UpdateProfileData {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setIsUpdating(true)
    setErrorMessage('')

    try {
      const updateData: UpdateProfileData = {}

      // Only include fields that have been changed
      if (formData.name !== user.name) updateData.name = formData.name
      if (formData.email !== user.email) updateData.email = formData.email
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      // Don't make API call if nothing has changed
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('No changes to save')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to update profile')
      }

      setSuccessMessage('Profile updated successfully')
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }))
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading) return <LoadingSpinner />
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background-alt">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link 
          href="/wishlists"
          className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to wishlists
        </Link>

        <h1 className="text-2xl font-semibold text-text-primary mb-8">Profile Settings</h1>

        <div className="bg-background rounded-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h2 className="text-lg font-medium text-text-primary mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={e => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
    </div>
  )
} 