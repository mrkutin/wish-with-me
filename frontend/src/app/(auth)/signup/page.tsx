'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up')
      }

      // Store the token
      localStorage.setItem('token', data.token)
      
      // Redirect to dashboard
      router.push('/wishlists')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <h1 className="text-2xl font-semibold text-text-primary">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-background-card py-8 px-6 shadow-sm rounded-lg border border-border sm:px-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              {error && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-text-primary"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-primary"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary-dark">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary-dark">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background-card text-text-secondary">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2.5 px-4 rounded-md shadow-sm bg-background border border-border text-sm font-medium text-text-primary hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="h-5 w-5 mr-2"
                  />
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 