export interface WishlistItem {
  _id: string
  name: string
  description?: string
  price?: number
  currency?: string
  url?: string
  image?: string
  bought: boolean
}

export interface Wishlist {
  _id: string
  name: string
  description: string
  dueDate?: string
  owner?: string
  createdAt: string
  updatedAt: string
  sharedToken?: string
  userId: string
  userName: string
  items: any[]
  sharedWith: any[]
}