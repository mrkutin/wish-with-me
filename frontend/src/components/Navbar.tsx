'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import NavbarSkeleton from './NavbarSkeleton'
import SuccessToast from './SuccessToast'

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const { user, logout, loading } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await logout()
      setShowSuccessToast(true)
    } catch (err) {
      console.error('Failed to logout:', err)
    }
    setShowDropdown(false)
  }

  if (loading) {
    return <NavbarSkeleton />
  }

  return (
    <>
      <header className="px-6 py-4 border-b border-border bg-background">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="text-xl font-semibold text-text-primary"
          >
            WishWithMe
          </Link>

          <div className="flex items-center space-x-4">
            {!user ? (
              <Link 
                href="/login" 
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign in
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-alt transition-colors"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-background-alt transition-colors flex items-center cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {showSuccessToast && (
        <SuccessToast
          message="Successfully signed out"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  )
} 