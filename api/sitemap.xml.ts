import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE_URL = 'https://inspirehome.gr';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
  { path: '/info', priority: '0.5', changefreq: 'monthly' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    // Fetch product data to generate dynamic URLs
    const productsUrl = `${SITE_URL}/data/liberta-products.json`;
    const otherUrl = `${SITE_URL}/data/other-products.json`;

    const [libertaRes, otherRes] = await Promise.allSettled([
      fetch(productsUrl).then(r => r.ok ? r.json() : []),
      fetch(otherUrl).then(r => r.ok ? r.json() : []),
    ]);

    const liberta = libertaRes.status === 'fulfilled' ? libertaRes.value : [];
    const other = otherRes.status === 'fulfilled' ? otherRes.value : [];
    const allProducts = [...liberta, ...other];

    // Extract unique category slugs
    const categorySet = new Set<string>();
    for (const p of allProducts) {
      if (p.categories) {
        for (const cat of p.categories) {
          const parts = cat.split('>').map((s: string) => s.trim().toLowerCase());
          parts.forEach((part: string) => categorySet.add(encodeURIComponent(part)));
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Category pages
    for (const slug of categorySet) {
      xml += `  <url>
    <loc>${SITE_URL}/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Product pages (only in-stock products)
    for (const product of allProducts) {
      if (!product.slug || !product.inStock) continue;
      xml += `  <url>
    <loc>${SITE_URL}/product/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error: any) {
    return res.status(500).send(`<!-- Error generating sitemap: ${error.message} -->`);
  }
}
