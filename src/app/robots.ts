import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://ouleeh.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/explore', '/salones/', '/business'],
        disallow: ['/admin/', '/perfil/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
