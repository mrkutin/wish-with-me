const puppeteer = require('puppeteer')
const logger = require('../utils/logger')

let browser = null

async function initialize() {
  try {
    logger.info('Initializing headless browser...')
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
    logger.info('Browser initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize browser:', {
      error: error.message,
      stack: error.stack
    })
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
    logger.info('Browser closed')
  }
}

async function setupPageLogging(page) {
  page.on('console', msg => logger.debug('Browser console:', { type: msg.type(), text: msg.text() }))
  page.on('pageerror', error => logger.debug('Page error:', { message: error.message, stack: error.stack }))
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

async function extractProductName(page) {
  return await page.evaluate(() => {
    const cleanText = text => text
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[|•\-–—].*$/, '')
      .replace(/купить.*$/i, '')
      .replace(/buy.*$/i, '')
      .replace(/в интернет.*$/i, '')
      .trim()

    const strategies = [
      // JSON-LD
      () => {
        const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]')
        for (const element of jsonLdElements) {
          try {
            const data = JSON.parse(element.textContent)
            if (data['@type'] === 'Product' && data.name) return cleanText(data.name)
            if (Array.isArray(data)) {
              const product = data.find(item => item['@type'] === 'Product')
              if (product?.name) return cleanText(product.name)
            }
          } catch (e) {}
        }
      },
      // Meta tags
      () => {
        const metaSelectors = ['meta[property="og:title"]', 'meta[name="title"]', 'meta[property="product:title"]']
        for (const selector of metaSelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content) return cleanText(meta.content)
        }
      },
      // Common selectors
      () => {
        const selectors = [
          '[data-widget="webProductHeading"]',
          '.rk4 h1',
          'h1[itemprop="name"]',
          '[data-auto="productName"]',
          '.product-name',
          '.product-title',
          'h1'
        ]
        for (const selector of selectors) {
          const element = document.querySelector(selector)
          if (element?.textContent) return cleanText(element.textContent)
        }
      }
    ]

    return strategies.reduce((result, strategy) => result || strategy(), null)
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
      logger.error('No URL provided')
      return null
    }

    logger.debug('Starting extraction process', { url })

    page = await getPage()
    await configurePage(page)
    await navigateToUrl(page, url)
    
    const productName = await extractProductName(page)

    if (productName) {
      logger.info('Successfully extracted name:', { url, name: productName })
      return productName
    }

    return extractNameFromUrlPath(url)

  } catch (error) {
    logger.error('Failed to extract name from URL:', {
      url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
    return null
  } finally {
    if (page) {
      await page.close().catch(error => {
        logger.error('Error closing page:', {
          error: error.message
        })
      })
    }
  }
}

module.exports = {
  initialize,
  cleanup,
  extractNameFromUrl
} 