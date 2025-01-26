import { Gift, Share2, Edit, Trash2, Link as LinkIcon, Calendar } from 'lucide-react'
import Link from 'next/link'
import DropdownMenu from './DropdownMenu'

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

  return (
    <div className={`
      bg-background rounded-lg border transition-all duration-200
      ${isUpcoming 
        ? 'border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
        : 'border-border hover:border-primary/20'
      }
      group hover:shadow-lg
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
                  ${isUpcoming ? 'text-primary' : 'text-text-secondary'}
                `}>
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{formattedDate}</span>
                  {isUpcoming && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                      Coming soon
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 