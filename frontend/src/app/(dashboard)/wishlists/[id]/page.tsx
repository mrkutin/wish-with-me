'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ExternalLink, Edit, Trash2, Gift, Heart, Star, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import DropdownMenu from '@/components/DropdownMenu'
import ErrorToast from '@/components/ErrorToast'
import Cookies from 'js-cookie'
import AddItemModal from '@/components/AddItemModal'
import SuccessToast from '@/components/SuccessToast'

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

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchWishlist()
  }, [resolvedParams.id])

  async function fetchWishlist() {
    try {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${resolvedParams.id}`, {
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
  }

  async function handleDeleteItem(itemId: string) {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${resolvedParams.id}/items/${itemId}`, {
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

  async function handleAddItem(data: {
    name: string
    url?: string
    price?: number
    currency?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
  }) {
    try {
      const token = Cookies.get('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${resolvedParams.id}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        throw new Error('Failed to add item')
      }

      const newItem = await res.json()
      
      // Update local state
      setWishlist(prev => 
        prev ? {
          ...prev,
          items: [...prev.items, newItem]
        } : null
      )

      setSuccessMessage('Item added successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
      throw err // Re-throw to handle in modal
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

  const priorityColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
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
                <div 
                  key={item._id}
                  className="bg-background rounded-lg border border-border hover:border-primary/20 transition-colors p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-text-primary flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                        {item.url ? (
                          <a 
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center hover:text-primary transition-colors"
                          >
                            {item.name}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      {item.price && (
                        <p className="mt-1 text-text-secondary">
                          {item.price.toLocaleString(undefined, {
                            style: 'currency',
                            currency: item.currency || 'USD'
                          })}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-2 text-sm text-text-secondary">{item.notes}</p>
                      )}
                    </div>
                    <DropdownMenu
                      actions={[
                        {
                          label: 'Edit',
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => {/* TODO: Implement edit */}
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDeleteItem(item._id),
                          variant: 'danger'
                        }
                      ]}
                    />
                  </div>
                  {item.priority && (
                    <div className="mt-4">
                      <span className={`text-sm font-medium ${priorityColors[item.priority]}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    </div>
                  )}
                </div>
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