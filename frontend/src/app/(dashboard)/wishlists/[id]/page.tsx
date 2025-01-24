'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Gift, Star, Package } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorToast from '@/components/ErrorToast'
import Cookies from 'js-cookie'
import AddItemModal from '@/components/AddItemModal'
import SuccessToast from '@/components/SuccessToast'
import WishlistItemCard from '@/components/WishlistItemCard'

interface WishlistItem {
  _id: string
  name: string
  url?: string
  price?: number
  currency?: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}

interface Wishlist {
  _id: string
  name: string
  description?: string
  items: WishlistItem[]
  createdAt: string
  updatedAt: string
}

export default function WishlistDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchWishlist = useCallback(async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Wishlist not found')
        }
        throw new Error('Failed to fetch wishlist')
      }

      const data = await res.json()
      setWishlist(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  async function handleDeleteItem(itemId: string) {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${id}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete item')
      }

      // Update local state
      setWishlist(prev => 
        prev ? {
          ...prev,
          items: prev.items.filter(item => item._id !== itemId)
        } : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  async function handleAddItem(itemData: {
    name: string
    url?: string
    price?: number
    currency?: string
    image?: string
  }) {
    try {
      const token = Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add item')
      }

      const newItem = await response.json()
      
      // Update local state
      setWishlist(prev => prev ? {
        ...prev,
        items: [...prev.items, newItem]
      } : null)

      setShowAddModal(false)
      setSuccessMessage('Item added successfully')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to add item')
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-alt p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!wishlist) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-background-alt">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link 
                href="/wishlists"
                className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to wishlists
              </Link>
              <h1 className="text-2xl font-semibold text-text-primary flex items-center">
                <Gift className="h-6 w-6 mr-2 text-primary" />
                {wishlist.name}
              </h1>
              {wishlist.description && (
                <p className="mt-1 text-text-secondary flex items-center">
                  <Star className="h-4 w-4 mr-2 text-text-secondary" />
                  {wishlist.description}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          {wishlist.items.length === 0 ? (
            <div className="bg-background rounded-lg border border-border p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-text-secondary mb-4" />
              <h3 className="text-lg font-medium text-text-primary">No items yet</h3>
              <p className="mt-2 text-text-secondary">Start adding items to your wishlist.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.items.map(item => (
                <WishlistItemCard
                  key={item._id}
                  item={item}
                  onEdit={() => {/* TODO: Implement edit */}}
                  onDelete={() => handleDeleteItem(item._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />

      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError('')}
        />
      )}
    </>
  )
} 