
import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/node/dashboard/'],
    },
    sitemap: 'https://nodebase.ai/sitemap.xml',
  }
}
