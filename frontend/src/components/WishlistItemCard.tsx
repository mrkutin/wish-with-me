'use client'

import { ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WishlistItemProps {
  item: {
    _id: string
    name: string
    url?: string
    image?: string
    price?: number
    currency?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
  }
  onEdit?: () => void
  onDelete?: () => void
}

export default function WishlistItemCard({ item, onEdit, onDelete }: WishlistItemProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  
  const showIcon = !item.image || imageError
  const isOzon = item.url?.includes('ozon.ru')

  console.log('Item image URL:', item.image)
  console.log('Show icon:', showIcon)

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-4">
      <div className="flex gap-4">
        <div className="relative aspect-square w-24 flex-shrink-0">
          {showIcon ? (
            <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
              <ShoppingBag className="w-1/2 h-1/2 text-gray-400" />
            </div>
          ) : (
            <Image
              src={item.image!}
              alt={item.name}
              fill
              sizes="(max-width: 96px) 100vw, 96px"
              className="object-contain rounded-md"
              onError={(e) => {
                console.error('Image failed to load:', e)
                setImageError(true)
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 mr-2">
              <h3 
                className="text-text-primary font-medium line-clamp-2 cursor-default"
                title={item.name}
              >
                {item.name}
              </h3>
            </div>
            <button
              onClick={onEdit}
              className="text-text-secondary hover:text-text-primary p-1 flex-shrink-0"
            >
              <span className="sr-only">Edit item</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 13v-2h2v2H4zm5-2h2v2H9v-2zm5 0h2v2h-2v-2z" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-text-primary truncate">
              {item.price} {item.currency}
            </p>
            {isOzon && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-[#005bff] hover:text-[#004edb] flex-shrink-0 ml-2"
              >
                ozon
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 