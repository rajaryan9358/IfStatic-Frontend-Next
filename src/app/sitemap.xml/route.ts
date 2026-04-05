import { readFile } from 'fs/promises';
import path from 'path';

const getSitemapPath = () => path.join(process.cwd(), 'public', 'sitemap.xml');

const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3000/</loc>
  </url>
</urlset>
`;

export async function GET() {
  try {
    const xml = await readFile(getSitemapPath(), 'utf8');

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }
}