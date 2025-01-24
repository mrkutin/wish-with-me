'use client'

import { ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

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
  const [imageError, setImageError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const showIcon = !item.image || imageError
  
  // Determine marketplace
  const getMarketplace = (url?: string) => {
    if (!url) return null
    if (url.includes('ozon.ru')) return { name: 'ozon', color: '#005bff' }
    if (url.includes('market.yandex')) return { name: 'yandex', color: '#f33' }
    if (url.includes('wildberries.ru')) return { name: 'wb', color: '#cb11ab' }
    return null
  }

  const marketplace = getMarketplace(item.url)

  return (
    <>
      <div className="bg-background rounded-lg shadow-sm border border-border p-4 h-[180px]">
        <div className="flex gap-4 h-full">
          <div className="relative aspect-square w-32 flex-shrink-0">
            {showIcon ? (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                <ShoppingBag className="w-1/2 h-1/2 text-gray-400" />
              </div>
            ) : (
              <Image
                src={item.image!}
                alt={item.name}
                fill
                sizes="(max-width: 128px) 100vw, 128px"
                className="object-contain rounded-md"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1 mr-2">
                  <h3 
                    className="text-text-primary font-medium text-base break-words"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-text-secondary hover:text-error p-1 flex-shrink-0 transition-colors"
                >
                  <span className="sr-only">Delete item</span>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-2">
              <div className="flex items-center justify-between min-h-[32px]">
                {item.price ? (
                  <p className="text-lg font-semibold text-text-primary truncate">
                    {Number(item.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} {item.currency}
                  </p>
                ) : (
                  <div className="text-text-secondary text-sm">No price set</div>
                )}
                {marketplace && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold flex-shrink-0 ml-2 transition-colors"
                    style={{ color: marketplace.color }}
                  >
                    {marketplace.name}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete?.()
          setShowDeleteConfirm(false)
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </>
  )
} 