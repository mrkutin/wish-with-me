import { NextResponse } from 'next/server'
import { Wishlist } from '@/types/wishlist'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token: shareToken } = await context.params
    const token = (await cookies()).get('token')?.value
    const userCookie = (await cookies()).get('user')?.value
    
    if (!token || !userCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Now TypeScript knows these values are strings
    const currentUser = JSON.parse(userCookie)
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/wishlists/${shareToken}/share`
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetUserId: currentUser._id
      })
    })
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to update wishlist sharing' },
        { status: res.status }
      )
    }
    
    const updatedWishlist: Wishlist = await res.json()
    return NextResponse.json(updatedWishlist)
    
  } catch (error) {
    console.error('[SHARE_ROUTE] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}