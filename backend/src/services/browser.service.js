const puppeteer = require('puppeteer')
const logger = require('../utils/logger')

let browser = null

const marketplaces = {
  OZON: {
    domain: 'ozon.ru',
    selectors: {
      name: 'h1[data-widget="webProductHeading"], div[data-widget="webProductHeading"], h1',
      price: '[data-widget="webPrice"] span',
      image: 'img[src*="cdn"][src*="product"], img[data-widget="webGallery"]'
    },
    parse: (document, { cleanText, extractPrice }) => ({
      name: cleanText(document.querySelector('h1[data-widget="webProductHeading"], div[data-widget="webProductHeading"], h1')?.textContent || ''),
      price: extractPrice(document.querySelector('[data-widget="webPrice"]')?.textContent || ''),
      currency: 'RUB',
      image: document.querySelector('img[src*="cdn"][src*="product"], img[data-widget="webGallery"]')?.src
    })
  },
  WILDBERRIES: {
    domain: 'wildberries.ru',
    useApi: true,
    selectors: {
      name: '.product-page__header h1, .product-page h1, h1.same-part-kt__header',
      price: '.price-block__final-price, .price-block__price, span.price-block__final-price',
      image: '.slide__content img[src], .j-zoom-image[src], img.photo-zoom__preview[src]'
    },
    parse: (document, { cleanText, extractPrice }) => ({
      name: cleanText(document.querySelector('.product-page__header h1, .product-page h1, h1.same-part-kt__header')?.textContent || ''),
      price: extractPrice(document.querySelector('.price-block__final-price, .price-block__price, span.price-block__final-price')?.textContent || ''),
      currency: 'RUB',
      image: document.querySelector('.slide__content img[src], .j-zoom-image[src], img.photo-zoom__preview[src]')?.src
    })
  },
  YANDEX_MARKET: {
    domain: 'market.yandex.ru',
    selectors: {
      name: '[data-auto="product-headline"], [data-baobab-name="title"], h1',
      price: '[data-auto="price-value"], [data-zone-name="price"]',
      image: '[data-auto="product-image"], [data-zone-name="picture"] img'
    },
    cookies: [
      { name: 'yandex_login', value: '', domain: '.yandex.ru' },
      { name: 'yandexmarket', value: '1', domain: '.market.yandex.ru' },
      { name: '_ym_uid', value: Date.now().toString(), domain: '.market.yandex.ru' }
    ],
    parse: (document, { cleanText, extractPrice }) => ({
      name: cleanText(document.querySelector('[data-auto="product-headline"], [data-baobab-name="title"], h1')?.textContent || ''),
      price: extractPrice(document.querySelector('[data-auto="price-value"], [data-zone-name="price"]')?.textContent || ''),
      currency: 'RUB',
      image: document.querySelector('[data-auto="product-image"], [data-zone-name="picture"] img')?.src
    })
  }
}

async function initialize() {
  try {
    logger.info(`Initializing headless browser...`)
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
        '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920x1080',
        '--start-maximized'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: null
    })
    logger.info(`Browser initialized successfully`)
  } catch (error) {
    logger.error(`Failed to initialize browser: ${JSON.stringify({
      error: error.message,
      stack: error.stack
    })}`)
    throw error
  }
}

async function getPage() {
  if (!browser) {
    throw new Error('Browser not initialized')
  }
  return await browser.newPage()
}

async function cleanup() {
  if (browser) {
    await browser.close()
    browser = null
    logger.info(`Browser closed`)
  }
}

async function setupPageLogging(page) {
  page.on('console', msg => logger.debug(`Browser console: ${JSON.stringify({ type: msg.type(), text: msg.text() })}`))
  page.on('pageerror', error => logger.debug(`Page error: ${JSON.stringify({ message: error.message, stack: error.stack })}`))
  page.on('request', request => logger.debug('Outgoing request:', { url: request.url(), method: request.method() }))
  page.on('response', response => logger.debug('Received response:', { url: response.url(), status: response.status() }))
}

async function applyBotEvasion(page) {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    window.chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
      app: {}
    }
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'ru'] })
    Object.defineProperty(navigator, 'plugins', {
      get: () => [{ 0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "PDF" }, name: "Chrome PDF Plugin" }]
    })
  })
}

async function setPageHeaders(page) {
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  })
}

async function configurePage(page) {
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36')
  
  await setupPageLogging(page)
  await applyBotEvasion(page)
  await setPageHeaders(page)
  await page.setJavaScriptEnabled(true)
  
  // Additional evasion for Yandex Market
  await page.evaluateOnNewDocument(() => {
    // Override permissions API
    const originalQuery = window.navigator.permissions.query
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    )
    
    // Add missing properties
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 })
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 })
  })

  // Additional headers for Wildberries
  await page.setExtraHTTPHeaders({
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  })

  // Additional evasion for Wildberries
  await page.evaluateOnNewDocument(() => {
    // Override navigator properties
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' })
    Object.defineProperty(navigator, 'productSub', { get: () => '20100101' })
    Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' })
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 })

    // Add touch support check
    window.TouchEvent = function() {}

    // Add WebGL support
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(type) {
      if (type === 'webgl2') return null
      return getContext.apply(this, arguments)
    }
  })
}

async function navigateToUrl(page, url) {
  const domain = new URL(url).hostname
  
  const marketplace = Object.values(marketplaces).find(m => domain.endsWith(m.domain))
  
  if (marketplace?.cookies) {
    await page.setCookie(...marketplace.cookies)
  }
  
  if (marketplace?.domain === 'wildberries.ru') {
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1')
    
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ru,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Referer': 'https://www.wildberries.ru/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    })

    await page.waitForTimeout(Math.random() * 1000 + 500)
  }

  const response = await page.goto(url, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 60000
  })

  if (marketplace?.domain === 'wildberries.ru') {
    await page.waitForTimeout(2000)

    await page.evaluate(() => {
      const scrollStep = 100
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      return new Promise(async (resolve) => {
        for (let i = 0; i < 3; i++) {
          window.scrollBy(0, scrollStep)
          await delay(100)
          window.scrollBy(0, -scrollStep/2)
          await delay(100)
        }
        resolve()
      })
    })

    try {
      await page.waitForFunction(() => {
        const name = document.querySelector('.product-page__header h1, .product-page h1, h1.same-part-kt__header')?.textContent
        const price = document.querySelector('.price-block__final-price, .price-block__price, span.price-block__final-price')?.textContent
        return name && price
      }, { timeout: 15000 })
    } catch (e) {
      logger.error('Failed to extract Wildberries content:', {
        url,
        error: e.message,
        stack: e.stack
      })
      throw new Error('Failed to extract product details')
    }
  }

  return response
}

async function extractProductInfo(page) {
  return await page.evaluate((marketplaces) => {
    const cleanText = text => text
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[|•\-–—].*$/, '')
      .replace(/купить.*$/i, '')
      .replace(/buy.*$/i, '')
      .replace(/в интернет.*$/i, '')
      .trim()

    const extractPrice = text => {
      const numbers = text.replace(/[^\d.,]/g, '')
      return numbers ? parseFloat(numbers.replace(',', '.')) : null
    }

    const url = window.location.href
    const marketplace = Object.values(marketplaces)
      .find(m => url.includes(m.domain))

    const strategies = [
      // JSON-LD
      () => {
        const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]')
        for (const element of jsonLdElements) {
          try {
            const data = JSON.parse(element.textContent)
            if (data['@type'] === 'Product') {
              return {
                name: data.name ? cleanText(data.name) : null,
                price: data.offers?.price || null,
                currency: data.offers?.priceCurrency || null,
                image: Array.isArray(data.image) ? data.image[0] : (typeof data.image === 'string' ? data.image : null)
              }
            }
            if (Array.isArray(data)) {
              const product = data.find(item => item['@type'] === 'Product')
              if (product) {
                return {
                  name: product.name ? cleanText(product.name) : null,
                  price: product.offers?.price || null,
                  currency: product.offers?.priceCurrency || null,
                  image: Array.isArray(product.image) ? product.image[0] : (typeof product.image === 'string' ? product.image : null)
                }
              }
            }
          } catch (e) {}
        }
      },

      // Marketplace-specific parser
      () => marketplace?.parse(document, { cleanText, extractPrice }),

      // Generic meta tags (fallback)
      () => {
        const result = {}
        const metaTitleSelectors = ['meta[property="og:title"]', 'meta[name="title"]', 'meta[property="product:title"]']
        const metaPriceSelectors = ['meta[property="product:price:amount"]', 'meta[property="og:price:amount"]']
        const metaCurrencySelectors = ['meta[property="product:price:currency"]', 'meta[property="og:price:currency"]']
        const metaImageSelectors = [
          'meta[property="og:image:secure_url"]',
          'meta[property="og:image"]',
          'meta[property="product:image"]',
          'meta[property="twitter:image"]'
        ]

        for (const selector of metaTitleSelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content) {
            result.name = cleanText(meta.content)
            break
          }
        }

        for (const selector of metaPriceSelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content) {
            result.price = parseFloat(meta.content)
            break
          }
        }

        for (const selector of metaCurrencySelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content) {
            result.currency = meta.content
            break
          }
        }

        for (const selector of metaImageSelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content && meta.content.startsWith('http')) {
            result.image = meta.content
            break
          }
        }

        return Object.keys(result).length ? result : null
      },

      // Generic selectors (last resort)
      () => {
        const result = {}
        
        // Marketplace-specific name selectors
        const nameSelectors = [
          // Ozon
          'h1[data-widget="webProductHeading"]',
          // Wildberries
          '.product-page__header h1',
          // Yandex.Market
          'h1._3TfWusA7bt',
          // Generic
          'h1[itemprop="name"]',
          '.product-title',
          '.product-name'
        ]

        // Marketplace-specific price selectors
        const priceSelectors = [
          // Ozon
          '[data-widget="webPrice"] span',
          // Wildberries
          '.price-block__final-price',
          // Yandex.Market
          'span[data-auto="price-value"]',
          // Generic
          '.price',
          '[itemprop="price"]'
        ]

        // Marketplace-specific image selectors
        const imageSelectors = [
          // Ozon
          'img[src*="cdn"][src*="product"]',
          'img[data-index="0"]',
          // Wildberries
          '.slide__content img',
          '.photo-zoom__preview',
          // Yandex.Market
          'img._3Wp5KMHYn1',
          '.image_type_center img',
          // Generic fallbacks
          'img[itemprop="image"]',
          '.product-image img'
        ]

        for (const selector of nameSelectors) {
          const element = document.querySelector(selector)
          if (element?.textContent) {
            result.name = cleanText(element.textContent)
            break
          }
        }

        for (const selector of priceSelectors) {
          const element = document.querySelector(selector)
          if (element) {
            const priceText = element.getAttribute('content') || element.textContent
            const price = extractPrice(priceText)
            if (price) {
              result.price = price
              // Try to determine currency from the price text
              if (priceText.includes('₽')) result.currency = 'RUB'
              else if (priceText.includes('$')) result.currency = 'USD'
              else if (priceText.includes('€')) result.currency = 'EUR'
              break
            }
          }
        }

        for (const selector of imageSelectors) {
          const element = document.querySelector(selector)
          const imgUrl = element?.src || element?.getAttribute('data-src') || element?.getAttribute('data-lazy-src')
          if (imgUrl && imgUrl.startsWith('http')) {
            result.image = imgUrl
            break
          }
        }

        return Object.keys(result).length ? result : null
      }
    ]

    return strategies.reduce((result, strategy) => {
      if (result && Object.keys(result).length) return result
      return strategy() || {}
    }, null)
  }, marketplaces)
}

function extractNameFromUrlPath(url) {
  const urlPath = new URL(url).pathname
  const lastSegment = urlPath.split('/').filter(Boolean).pop()
  
  if (lastSegment) {
    const nameFromUrl = lastSegment
      .replace(/-/g, ' ')
      .replace(/\d+$/, '')
      .trim()
    logger.info('Extracted name from URL:', { url, name: nameFromUrl })
    return nameFromUrl
  }
  
  return null
}

// Add marketplace-specific URL validation
function isValidMarketplaceUrl(url) {
  try {
    const urlObj = new URL(url)
    const isValid = Object.values(marketplaces).some(m => urlObj.hostname.endsWith(m.domain))
    if (!isValid) {
      const validDomains = Object.values(marketplaces).map(m => m.domain)
      logger.warn(`Unsupported marketplace URL: ${url}. Supported marketplaces: ${validDomains.join(', ')}`)
    }
    return isValid
  } catch {
    logger.error(`Invalid URL format: ${url}`)
    return false
  }
}

async function getWildberriesProductInfo(url) {
  try {
    // Extract product ID from URL
    const productId = url.match(/catalog\/(\d+)/)?.[1]
    if (!productId) {
      throw new Error('Could not extract product ID from URL')
    }

    // Use Wildberries mobile API
    const apiUrl = `https://card.wb.ru/cards/v1/detail?appType=1&curr=rub&dest=-1257786&spp=27&nm=${productId}`
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const product = data.data.products?.[0]

    if (!product) {
      throw new Error('Product not found in API response')
    }

    return {
      name: product.name,
      price: product.salePriceU / 100, // Price comes in kopeks
      currency: 'RUB',
      image: `https://images.wbstatic.net/big/new/${Math.floor(productId/10000)}0000/${productId}-1.jpg`
    }
  } catch (error) {
    logger.error('Failed to fetch Wildberries product info:', error)
    return null
  }
}

async function extractNameFromUrl(url) {
  let page = null
  try {
    if (!isValidMarketplaceUrl(url)) {
      logger.warn(`Unsupported marketplace URL: ${url}`)
      return null
    }

    // Check if it's a Wildberries URL
    const domain = new URL(url).hostname
    const marketplace = Object.values(marketplaces).find(m => domain.endsWith(m.domain))
    
    if (marketplace?.domain === 'wildberries.ru') {
      return await getWildberriesProductInfo(url)
    }

    logger.debug(`Starting extraction process: ${JSON.stringify({ url })}`)

    page = await getPage()
    await configurePage(page)
    await navigateToUrl(page, url)
    
    const productInfo = await extractProductInfo(page)
    
    if (!productInfo.name) {
      productInfo.name = extractNameFromUrlPath(url)
    }

    logger.info(`Successfully extracted product info: ${JSON.stringify({ url, productInfo })}`)
    return productInfo

  } catch (error) {
    logger.error(`Failed to extract info from URL: ${JSON.stringify({
      url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })}`)
    return null
  } finally {
    if (page) {
      await page.close().catch(error => {
        logger.error(`Error closing page: ${JSON.stringify({
          error: error.message
        })}`)
      })
    }
  }
}

module.exports = {
  initialize,
  cleanup,
  extractNameFromUrl
} 