'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, Gift, Star, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function MarketingPage() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      window.location.href = '/wishlists'
    }
  }, [user])

  return (
    <div className="flex min-h-full flex-col">
      <main>
        {/* Hero Section */}
        <section className="px-6 py-24 sm:py-32 relative isolate">
          <div className="absolute -z-10 right-5 top-10">
            <Heart className="h-24 w-24 text-accent/10 rotate-12" />
          </div>
          <div className="absolute -z-10 left-10 bottom-10">
            <Gift className="h-16 w-16 text-accent/10 -rotate-12" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 flex items-center justify-center">
              <span className="inline-flex items-center gap-x-2 rounded-full bg-accent/10 px-4 py-1 text-sm text-accent ring-1 ring-accent/20">
                <Star className="h-4 w-4 fill-accent" />
                Create your first wishlist for free
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Create and share your wishlists
              <br />
              <span className="text-primary">with anyone, anywhere</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Make gift-giving easier. Create personalized wishlists, share them with friends and family,
              and keep track of your shopping - all in one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/wishlists"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                My Wishlists
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-accent transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Rest of the page remains the same */}
      </main>
    </div>
  )
} 