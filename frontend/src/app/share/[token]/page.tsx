import { useState, useEffect } from 'react'
import { Wishlist, WishlistItem } from '@/types/wishlist'

export default function SharePage({ params }: { params: { token: string } }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then(res => res.json())
      .then(setWishlist)
  }, [params.token])

  const markAsPurchased = async (itemId: string) => {
    await fetch(`/api/share/${params.token}/items/${itemId}`, {
      method: 'PATCH'
    })
    setWishlist(prev => prev ? {
      ...prev,
      items: prev.items.map(item => 
        item._id === itemId ? { ...item, purchased: true } : item
      )
    } : null)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{wishlist?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlist?.items.map((item: WishlistItem) => (
          <div key={item._id} className="border rounded-lg p-4 shadow-sm">
            {item.image && (
              <img 
                src={item.image} 
                alt={item.name}
                className="h-48 w-full object-cover mb-4 rounded"
              />
            )}
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {item.description && (
              <p className="text-gray-600 mt-2">{item.description}</p>
            )}
            <button
              onClick={() => markAsPurchased(item._id)}
              className={`mt-4 px-4 py-2 rounded ${
                item.purchased 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-light text-white'
              }`}
              disabled={item.purchased}
            >
              {item.purchased ? 'Already Purchased' : 'Mark as Purchased'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 