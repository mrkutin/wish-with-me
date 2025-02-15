import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PathLike } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BASE_URL = 'https://wishwith.me'
const LANGUAGES = ['en', 'ru']

const routes = [
  '',
  '/about',
  '/features',
  '/privacy',
  '/terms'
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${routes
    .map(route => `
    <url>
      <loc>${BASE_URL}${route}</loc>
      ${LANGUAGES.map(lang => `
        <xhtml:link 
          rel="alternate" 
          hreflang="${lang}"
          href="${BASE_URL}${lang === 'en' ? '' : '/' + lang}${route}"
        />`).join('')}
      <xhtml:link 
        rel="alternate" 
        hreflang="x-default"
        href="${BASE_URL}${route}"
      />
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
</urlset>`

// Write to dist
const distDir = resolve(__dirname, '../dist')
if (!existsSync(distDir)) {
  console.log('Creating dist directory')
  mkdirSync(distDir, { recursive: true })
}

const distPath = resolve(distDir, 'sitemap.xml')
console.log('Writing sitemap to:', distPath)
writeFileSync(distPath, sitemap)

// Copy to public
const publicPath = resolve(__dirname, '../public/sitemap.xml')
console.log('Copying sitemap to:', publicPath)
copyFileSync(distPath, publicPath)

console.log('Sitemap written successfully') 