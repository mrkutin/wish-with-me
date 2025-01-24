import Cookies from 'js-cookie'

export async function resolveUrl(url: string) {
  try {
    const token = Cookies.get('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlists/resolve-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to resolve URL')
    }

    return await response.json()
  } catch (error) {
    console.error('Error resolving URL:', error)
    return null
  }
} 