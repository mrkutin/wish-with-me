'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Gift, Share2, Edit, Trash2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import WishlistSkeleton from '@/components/WishlistSkeleton'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'
import Toast from '@/components/Toast'
import ErrorToast from '@/components/ErrorToast'
import DropdownMenu from '@/components/DropdownMenu'
import CreateWishlistModal from '@/components/CreateWishlistModal'
import Cookies from 'js-cookie'
import { WishlistCard } from '@/components/WishlistCard'
import { Wishlist } from '@/types/wishlist'
import { sortWishlists } from '@/utils/sortWishlists'

interface WishlistItem {
  _id: string
  name: string
  // ... other item properties
}

// Memoized sorting
const useSortedWishlists = (wishlists: Wishlist[]) => {
  const sorter = useCallback(
    (items: Wishlist[]) => sortWishlists(items),
    []
  )
  return sorter(wishlists)
}

export default function WishlistsPage() {
  const router = useRouter()
  const { loading: authLoading, error } = useAuth()
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [isLoadingWishlists, setIsLoadingWishlists] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteWishlist, setDeleteWishlist] = useState<Wishlist | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletedWishlist, setDeletedWishlist] = useState<Wishlist | null>(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function fetchWishlists() {
      if (authLoading) return
      
      try {
        const token = Cookies.get('token')
        if (!token) {
          router.push('/login')
          return
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store'
          }
        })

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch wishlists')
        }

        const data = await res.json()
        console.log('Fetched wishlists:', data)
        if (!ignore) {
          setWishlists(data)
        }
      } catch (err) {
        console.error('Failed to fetch wishlists:', err)
      } finally {
        if (!ignore) {
          setIsLoadingWishlists(false)
        }
      }
    }

    fetchWishlists()

    return () => {
      ignore = true
    }
  }, [authLoading, router])

  async function handleCreateWishlist(name: string, description: string, dueDate?: string) {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, dueDate })
    })

    if (!res.ok) {
      throw new Error('Failed to create wishlist')
    }

    const data = await res.json()
    
    // Add the new wishlist and sort
    setWishlists(prev => {
      const updated = [...prev, data]
      return updated.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    })
  }

  async function handleDeleteWishlist(wishlist: Wishlist) {
    setDeleteWishlist(wishlist)
  }

  async function confirmDelete() {
    if (!deleteWishlist) return

    setIsDeleting(true)
    try {
      const token = Cookies.get('token')
      
      // Store the wishlist before deleting
      const wishlistToDelete = deleteWishlist
      
      // Remove from UI immediately
      setWishlists(prev => prev.filter(w => w._id !== wishlistToDelete._id))
      setDeleteWishlist(null)
      
      // Show undo toast
      setDeletedWishlist(wishlistToDelete)
      setShowUndoToast(true)
      
      // Delete from server
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${wishlistToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete wishlist')
      }
    } catch (err) {
      console.error('Failed to delete wishlist:', err)
      // Restore the wishlist in UI if deletion failed
      if (deletedWishlist) {
        setWishlists(prev => [...prev, deletedWishlist])
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // Add undo function
  async function handleUndo() {
    if (!deletedWishlist) return

    try {
      const token = Cookies.get('token')
      
      // Restore in UI immediately
      setWishlists(prev => [...prev, deletedWishlist])
      setShowUndoToast(false)
      setDeletedWishlist(null)

      // Restore in backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: deletedWishlist.name,
          description: deletedWishlist.description
        })
      })

      if (!res.ok) {
        throw new Error('Failed to restore wishlist')
      }
    } catch (err) {
      console.error('Failed to restore wishlist:', err)
      // Remove from UI if restoration failed
      setWishlists(prev => prev.filter(w => w._id !== deletedWishlist._id))
    }
  }

  const sortedWishlists = useSortedWishlists(wishlists)

  if (authLoading || isLoadingWishlists) {
    return (
      <div className="min-h-screen bg-background-alt">
        <main className="max-w-7xl mx-auto px-6 py-8">
          <WishlistSkeleton />
        </main>
      </div>
    )
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

  return (
    <>
      <div className="min-h-screen bg-background-alt">
        <main className="max-w-7xl mx-auto px-6 py-8">
          {wishlists.length === 0 ? (
            <div className="bg-background rounded-lg border border-border p-12 text-center">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-semibold text-text-primary">Create your first wishlist</h2>
                <p className="mt-2 text-text-secondary">Get started by creating a new wishlist.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Wishlist
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-text-primary">My Wishlists</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wishlist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedWishlists.map((wishlist) => (
                  <WishlistCard
                    key={wishlist._id}
                    wishlist={wishlist}
                    onDelete={handleDeleteWishlist}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateWishlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWishlist}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteWishlist}
        onClose={() => setDeleteWishlist(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Wishlist"
        message={`Are you sure you want to delete "${deleteWishlist?.name}"? This action cannot be undone.`}
      />

      {showUndoToast && (
        <Toast
          message={`Deleted "${deletedWishlist?.name}"`}
          action={{
            label: 'Undo',
            onClick: handleUndo
          }}
          onClose={() => {
            setShowUndoToast(false)
            setDeletedWishlist(null)
          }}
          duration={5000}
        />
      )}

      {errorToast && (
        <ErrorToast
          message={errorToast}
          onClose={() => setErrorToast(null)}
        />
      )}
    </>
  )
} 