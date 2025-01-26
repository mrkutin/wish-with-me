export interface WishlistItem {
  _id: string
  name: string
  url?: string
  price?: number
  currency?: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Wishlist {
  _id: string
  userId: string
  name: string
  description: string
  dueDate?: string
  items: WishlistItem[]
  sharedWith: string[]
  createdAt: string
  updatedAt: string
} 