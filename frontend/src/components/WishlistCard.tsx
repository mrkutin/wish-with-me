import { Gift, Share2, Edit, Trash2, Link as LinkIcon, Calendar } from 'lucide-react'
import Link from 'next/link'
import DropdownMenu from './DropdownMenu'
import { useState, useEffect } from 'react'
import { Wishlist } from '@/types/wishlist'
import { useRouter } from 'next/navigation'
import EditWishlistModal from '@/components/EditWishlistModal'
import Cookies from 'js-cookie'
import { QRCode } from 'react-qrcode-logo'
import { Copy } from 'lucide-react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'

interface WishlistCardProps {
  wishlist: Wishlist
  onDelete: (wishlist: Wishlist) => void
  onUpdate?: () => void
  isShared?: boolean
}

export function WishlistCard({ wishlist, onDelete, onUpdate }: WishlistCardProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentWishlist, setCurrentWishlist] = useState(wishlist)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    setCurrentWishlist(wishlist)
  }, [wishlist])

  const formattedDate = currentWishlist.dueDate 
    ? new Date(currentWishlist.dueDate).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        timeZone: 'UTC'
      })
    : null

  const isUpcoming = currentWishlist.dueDate && 
    (new Date(currentWishlist.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7

  const getDueDateStatus = (dueDate?: string, daysRemaining?: number) => {
    if (!dueDate) return 'no-date';
    if (daysRemaining === undefined) {
      daysRemaining = getDaysRemaining(dueDate);
    }
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 7) return 'less-than-7';
    if (daysRemaining <= 30) return '7-30';
    return 'more-than-30';
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysRemaining = currentWishlist.dueDate 
    ? getDaysRemaining(currentWishlist.dueDate)
    : null;

  const status = getDueDateStatus(
    currentWishlist.dueDate,
    daysRemaining ?? undefined
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dropdown-container')) return
    router.push(`/wishlists/${currentWishlist._id}`)
  }

  const handleEdit = async (data: { name: string; description: string; dueDate?: string | null }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/${currentWishlist._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate || null
        })
      })

      if (!res.ok) throw new Error('Update failed')
      
      setCurrentWishlist(prev => ({
        ...prev,
        ...data,
        dueDate: data.dueDate || undefined,
        updatedAt: new Date().toISOString()
      }))
      
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      throw error
    }
  }

  const getShareLink = (token?: string) => 
    token ? `${process.env.NEXT_PUBLIC_BASE_URL}/wishlists/share/${token}` : ''

  const copyToClipboard = async () => {
    if (currentWishlist.sharedToken) {
      await navigator.clipboard.writeText(getShareLink(currentWishlist.sharedToken))
    }
  }

  return (
    <>
      <div className="h-full">
        <div 
          className={`
            bg-background rounded-lg border transition-all duration-200
            group shadow-sm hover:shadow-lg
            ${
              {
                'more-than-30': 'bg-blue-50/20 border-blue-200/30 hover:border-blue-300/40',
                '7-30': 'bg-orange-50/20 border-orange-200/30 hover:border-orange-300/40',
                'less-than-7': 'bg-red-50/20 border-red-200/30 hover:border-red-300/40',
                'no-date': 'bg-gray-50/20 border-gray-200/30 hover:border-gray-300/40',
                'expired': 'bg-gray-100/20 border-gray-300/30 hover:border-gray-400/40'
              }[status]
            }
          `}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push(`/wishlists/${currentWishlist._id}`)}
        >
          <div className="p-6 flex flex-col h-full min-h-[180px]">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex-shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary truncate">
                      {currentWishlist.name}
                    </h3>
                  </div>
                  {currentWishlist.description && (
                    <p className="mt-1 text-text-secondary text-sm line-clamp-2">
                      {currentWishlist.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 dropdown-container">
                  <DropdownMenu
                    items={[
                      {
                        label: 'Edit',
                        icon: Edit,
                        onClick: () => setShowEditModal(true)
                      },
                      {
                        label: 'Share',
                        icon: Share2,
                        onClick: () => setShowShareModal(true)
                      },
                      {
                        label: 'Delete',
                        icon: Trash2,
                        onClick: () => onDelete(currentWishlist),
                        variant: 'danger'
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-text-secondary">
                    <span className="font-medium text-text-primary">{currentWishlist.items.length}</span>
                    <span className="ml-1">items</span>
                  </div>
                  {formattedDate && (
                    <div className={`
                      flex items-center text-xs
                      ${
                        {
                          'more-than-30': 'text-blue-600',
                          '7-30': 'text-orange-600',
                          'less-than-7': 'text-red-600',
                          'expired': 'text-gray-500',
                          'no-date': 'text-gray-500'
                        }[status]
                      }
                    `}>
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formattedDate}</span>
                      <span className={`
                        ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium
                        ${
                          {
                            'more-than-30': 'bg-blue-100 text-blue-800',
                            '7-30': 'bg-orange-100 text-orange-800',
                            'less-than-7': 'bg-red-100 text-red-800',
                            'expired': 'bg-gray-100 text-gray-800',
                            'no-date': 'bg-gray-100 text-gray-800'
                          }[status]
                        }
                      `}>
                        {status === 'expired' ? 'Expired' : `${daysRemaining} days left`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EditWishlistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEdit}
        initialData={{
          name: currentWishlist.name,
          description: currentWishlist.description,
          dueDate: currentWishlist.dueDate
        }}
      />

      {showShareModal && (
        <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Share {currentWishlist.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Share Link</label>
                <div className="flex gap-2 items-center">
                  <input
                    value={currentWishlist.sharedToken 
                      ? getShareLink(currentWishlist.sharedToken)
                      : 'Generating share token...'}
                    readOnly
                    className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <QRCode 
                  value={getShareLink(currentWishlist.sharedToken)} 
                  size={160}
                  qrStyle="dots"
                  eyeRadius={5}
                  bgColor="#ffffff"
                  fgColor="#1f2937"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowShareModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
} 