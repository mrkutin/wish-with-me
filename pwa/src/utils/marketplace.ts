interface Marketplace {
  name: 'ozon' | 'yandex' | 'wb' | 'aliexpress'
  domain: string
}

const marketplaces: Marketplace[] = [
  { name: 'ozon', domain: 'ozon.ru' },
  { name: 'yandex', domain: 'market.yandex.ru' },
  { name: 'wb', domain: 'wildberries.ru' },
  { name: 'aliexpress', domain: 'aliexpress.ru' }
]

export function getMarketplace(url: string): Marketplace | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return marketplaces.find(m => domain.includes(m.domain)) || null
  } catch {
    return null
  }
}

export function groupItemsByMarketplace(items: any[]) {
  const groups: Record<string, any[]> = {}
  
  items.forEach(item => {
    const marketplace = item.url ? getMarketplace(item.url) : null
    const key = marketplace ? marketplace.name : 'other'
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })
  
  return groups
} 