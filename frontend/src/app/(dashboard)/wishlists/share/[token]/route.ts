import { NextResponse } from 'next/server'
import { Wishlist } from '@/types/wishlist'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = (await cookies()).get('token')?.value
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/wishlists/get-by-token/${params.token}`
    const res = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }
    
    const wishlist: Wishlist = await res.json()
    return NextResponse.json(wishlist)
    
  } catch (error) {
    console.error('[SHARE_ROUTE] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}