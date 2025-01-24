const puppeteer = require('puppeteer')
const logger = require('../utils/logger')

let browser = null

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
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36')
  
  await setupPageLogging(page)
  await applyBotEvasion(page)
  await setPageHeaders(page)
  await page.setJavaScriptEnabled(true)
}

async function navigateToUrl(page, url) {
  const domain = new URL(url).hostname
  await page.setCookie({ name: 'session-check', value: '1', domain })
  
  const response = await page.goto(url, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 30000
  })

  await Promise.race([
    page.waitForSelector('h1'),
    page.waitForSelector('meta[property="og:title"]'),
    page.waitForSelector('[data-widget="webProductHeading"]'),
    new Promise(resolve => setTimeout(resolve, 5000))
  ])

  return response
}

async function extractProductInfo(page) {
  return await page.evaluate(() => {
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
      // Meta tags
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
      // Common selectors
      () => {
        const result = {}
        const nameSelectors = [
          '[data-widget="webProductHeading"]',
          '.rk4 h1',
          'h1[itemprop="name"]',
          '[data-auto="productName"]',
          '.product-name',
          '.product-title',
          'h1'
        ]
        const priceSelectors = [
          '[itemprop="price"]',
          '.price-value',
          '.product-price',
          '[data-auto="price"]',
          '[data-widget="price"]',
          '.rk5'
        ]
        const imageSelectors = [
          // Ozon selectors
          'img[src*="cdn"][src*="product"]',
          'img[data-index="0"]',
          // Common selectors
          'img[itemprop="image"]',
          '.product-image img[src*="product"]',
          '.gallery__main-image img',
          '.product-gallery__image img',
          // Fallback selectors
          '[data-widget="webGallery"] img',
          '.product-image img',
          '.gallery-image',
          '.main-image'
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
  })
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

async function extractNameFromUrl(url) {
  let page = null
  try {
    if (!url) {
      logger.error(`No URL provided`)
      return null
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