import type { MetadataRoute } from 'next'

const BASE = 'https://www.cutting-image.co.uk'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return ['', '/services', '/gallery', '/about', '/contact', '/booking'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))
}
