import Cookies from 'js-cookie'

export async function resolveUrl(url: string) {
  try {
    const token = Cookies.get('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/resolve-item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    if (!res.ok) {
      throw new Error('Failed to resolve URL')
    }

    return await res.json()
  } catch (error) {
    console.error('Error resolving URL:', error)
    return null
  }
}
