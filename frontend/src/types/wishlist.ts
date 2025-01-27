export interface WishlistItem {
  _id: string
  name: string
  description?: string
  url?: string
  price?: number
  currency?: string
  image?: string
  purchased?: boolean
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
  sharedLink?: string
  createdAt: string
  updatedAt: string
} 