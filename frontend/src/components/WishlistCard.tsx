import { Gift, Share2, Edit, Trash2, Link as LinkIcon, Calendar } from 'lucide-react'
import Link from 'next/link'
import DropdownMenu from './DropdownMenu'
import { useState, useEffect } from 'react'

interface Wishlist {
  _id: string
  name: string
  description?: string
  dueDate?: string
  items: Array<{ _id: string; name: string }>
  createdAt: string
  updatedAt: string
}

interface WishlistCardProps {
  wishlist: Wishlist
  onDelete: (wishlist: Wishlist) => void
}

export function WishlistCard({ wishlist, onDelete }: WishlistCardProps) {
  const formattedDate = wishlist.dueDate 
    ? new Date(wishlist.dueDate).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : null

  const isUpcoming = wishlist.dueDate && 
    (new Date(wishlist.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7

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

  const daysRemaining = wishlist.dueDate 
    ? getDaysRemaining(wishlist.dueDate)
    : null;

  const status = getDueDateStatus(
    wishlist.dueDate,
    daysRemaining ?? undefined
  );

  return (
    <div className={`
      bg-background rounded-lg border transition-all duration-200
      group hover:shadow-lg
      ${
        {
          'more-than-30': 'border-blue-200/30 hover:border-blue-300/40',
          '7-30': 'border-orange-200/30 hover:border-orange-300/40',
          'less-than-7': 'border-red-200/30 hover:border-red-300/40',
          'no-date': 'border-gray-200/30 hover:border-gray-300/40',
          'expired': 'border-gray-300/30 hover:border-gray-400/40'
        }[status]
      }
    `}>
      <div className="p-6 flex flex-col h-full min-h-[180px]">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-shrink-0">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary truncate">
                  <Link 
                    href={`/wishlists/${wishlist._id}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {wishlist.name}
                  </Link>
                </h3>
              </div>
              {wishlist.description && (
                <p className="mt-1 text-text-secondary text-sm line-clamp-2">
                  {wishlist.description}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <DropdownMenu
                actions={[
                  {
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => {/* TODO: Implement edit */}
                  },
                  {
                    label: 'Share',
                    icon: <Share2 className="h-4 w-4" />,
                    onClick: () => {/* TODO: Implement share */}
                  },
                  {
                    label: 'Copy Link',
                    icon: <LinkIcon className="h-4 w-4" />,
                    onClick: () => {/* TODO: Implement copy link */}
                  },
                  {
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => onDelete(wishlist),
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
                <span className="font-medium text-text-primary">{wishlist.items.length}</span>
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
  )
} 