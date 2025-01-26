import { Wishlist } from '@/types/wishlist'

export const sortWishlists = (wishlists: Wishlist[]): Wishlist[] => {
  return [...wishlists].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
} 