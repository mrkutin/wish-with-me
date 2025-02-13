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
    cookies: [
      {
        name: '_ym_uid',
        value: Math.floor(Date.now() / 1000).toString(),
        domain: '.market.yandex.ru'
      },
      {
        name: '_ym_d',
        value: Math.floor(Date.now() / 1000).toString(),
        domain: '.market.yandex.ru'
      },
      {
        name: 'yandexuid',
        value: Math.floor(Date.now() / 1000).toString(),
        domain: '.yandex.ru'
      },
      {
        name: 'yuidss',
        value: Math.floor(Math.random() * 1000000000).toString(),
        domain: '.yandex.ru'
      },
      {
        name: 'i',
        value: Math.floor(Date.now() / 1000).toString(),
        domain: '.yandex.ru'
      },
      {
        name: 'yandex_gid',
        value: '213',  // Moscow region
        domain: '.yandex.ru'
      },
      {
        name: '_ym_isad',
        value: '2',
        domain: '.market.yandex.ru'
      }
    ],
    selectors: {
      name: 'h1[data-auto="headline"], h1[itemprop="name"], h1',
      price: 'div[data-auto="price"] span, div[data-zone-name="price"] span, span[itemprop="price"]',
      image: 'img[data-auto="product-image"], img[itemprop="image"], div[data-zone-name="gallery"] img[src]'
    },
    preNavigate: async (page) => {
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
      
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      )
      
      await page.evaluateOnNewDocument(() => {
        window.ontouchstart = null
      })
    }
  },
  ALIEXPRESS: {
    domain: 'aliexpress.ru',
    cookies: [
      {
        name: 'aep_usuc_f',
        value: 'site=rus&c_tp=RUB&region=RU&b_locale=ru_RU',
        domain: '.aliexpress.ru'
      }
    ],
    selectors: {
      name: 'h1.snow-ali-kit_Typography__base__1shggo.snow-ali-kit_Typography-Primary__base__1xz6yh, .product-title-text',
      price: '.snow-price_SnowPrice__mainS__2o_st, .product-price-current, .uniform-banner-box-price',
      image: '.ali-kit_Image__base__1pmq3 img, .magnifier-image'
    },
    preNavigate: async (page) => {
      await page.setViewport({ width: 1920, height: 1080 })
      
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      )
      
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-platform': '"macOS"'
      })
      
      await page.evaluateOnNewDocument(() => {
        delete navigator.webdriver
        window.navigator.chrome = { runtime: {} }
      })
    },
    postNavigate: async (page) => {
      await page.waitForSelector('.uniform-banner-box-price, .product-price-value', { timeout: 10000 })
      await page.waitForTimeout(2000)
    }
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

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function navigateToUrl(page, url) {
  const domain = new URL(url).hostname
  
  const marketplace = Object.values(marketplaces).find(m => domain.endsWith(m.domain))
  
  if (marketplace?.preNavigate) {
    await marketplace.preNavigate(page)
  }

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

    await delay(Math.random() * 1000 + 500)
  }

  if (marketplace?.domain === 'market.yandex.ru') {
    await delay(3000 + Math.random() * 2000)
    
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Referer': 'https://market.yandex.ru/',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-User': '?1'
    })
  }

  const response = await page.goto(url, {
    waitUntil: marketplace?.domain === 'market.yandex.ru' ? 'domcontentloaded' : ['domcontentloaded', 'networkidle0'],
    timeout: 60000
  })

  if (marketplace?.domain === 'wildberries.ru') {
    await delay(2000)

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

/**
 * Extract product information from the page using JSON-LD data
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<{name: string, price: number, currency: string, image: string}>}
 */
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

    return {}
  })
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

async function extractItemInfoByUrl(url) {
  let page = null
  try {
    if (!isValidMarketplaceUrl(url)) {
      logger.warn(`Unsupported marketplace URL: ${url}`)
      return null
    }

    const domain = new URL(url).hostname
    const marketplace = Object.values(marketplaces).find(m => domain.endsWith(m.domain))
    
    logger.debug(`Starting extraction process: ${JSON.stringify({ url })}`)

    page = await getPage()
    await configurePage(page)
    await navigateToUrl(page, url)
    
    let productInfo
    
    // Special handling for different marketplaces
    if (marketplace?.domain === 'aliexpress.ru') {
      productInfo = await page.evaluate(() => {
        // Try multiple selectors for name
        const nameElement = document.querySelector('h1[class*="Typography"]') || 
                           document.querySelector('h1[class*="ProductTitle"]') ||
                           document.querySelector('h1') ||
                           document.querySelector('[class*="product-title"]')
        
        // Try multiple selectors for price
        const priceElement = document.querySelector('[class*="SnowPrice__mainS"]') ||
                            document.querySelector('[class*="SnowPrice__mainM"]') ||
                            document.querySelector('[class*="ProductPrice__price"]') ||
                            document.querySelector('[class*="uniformBanner"] [class*="price"]') ||
                            Array.from(document.querySelectorAll('span')).find(el => 
                              el.textContent?.includes('₽') && 
                              /\d/.test(el.textContent)
                            )
        
        // Try multiple selectors for image
        const imageElement = Array.from(document.querySelectorAll('img')).find(img => 
          img.src?.includes('alicdn') && 
          (img.width > 200 || img.height > 200 || 
           img.getAttribute('width') > 200 || 
           img.getAttribute('height') > 200)
        )
        
        const name = nameElement?.textContent?.trim()
        const priceText = priceElement?.textContent?.trim()
        const image = imageElement?.src
        
        let price = null
        if (priceText) {
          console.log('Raw price text:', priceText)
          
          // Handle AliExpress price format (e.g., "9 199 ₽" or "9&nbsp;199&nbsp;₽")
          const cleanPrice = priceText
            .replace(/₽/g, '')  // Remove ruble symbol
            .replace(/&nbsp;/g, '')  // Remove HTML spaces
            .replace(/\s+/g, '')  // Remove regular spaces
            .trim()
          
          console.log('Clean price:', cleanPrice)
          
          // Parse the clean number
          if (/^\d+$/.test(cleanPrice)) {
            price = Number(cleanPrice)
          }
          
          console.log('Final price:', price)
        }
        
        console.log('Debug info:', { name, priceText, price, image })
        return { name, price, currency: 'RUB', image }
      })
    } else if (marketplace?.domain === 'wildberries.ru') {
      productInfo = await page.evaluate(() => {
        const name = document.querySelector('.product-page__header h1, .product-page h1, h1.same-part-kt__header')?.textContent?.trim()
        const priceText = document.querySelector('.price-block__final-price')?.textContent?.trim().split(' ')[0]
        const image = document.querySelector('.slide__content img[src], .j-zoom-image[src], img.photo-zoom__preview[src]')?.src
        
        let price = null
        if (priceText) {
          const numericPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.')
          price = parseFloat(numericPrice)
        }

        return {
          name,
          price,
          currency: 'RUB',
          image
        }
      })
    } else {
      productInfo = await extractProductInfo(page)
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
    throw error
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
  extractItemInfoByUrl
} 