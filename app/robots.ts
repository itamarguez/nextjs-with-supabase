import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://nextjs-with-supabase-teal-nu.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/chat/',
          '/admin/',
          '/fix-profile/',
          '/upgrade/success/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
