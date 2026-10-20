const fs = require('fs');
const content = fs.readFileSync('src/data/circuitTemplates.ts', 'utf8');

const regex = /id:\s*'([a-z0-9\-]+)',\s*\n\s*name:\s*'([^']+)',\s*\n\s*desc:\s*'([^']+)'/g;
let m;
const urls = [];

urls.push(`  <url>
    <loc>https://volt-flow-one.vercel.app/</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

urls.push(`  <url>
    <loc>https://volt-flow-one.vercel.app/#simulator</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);

while ((m = regex.exec(content)) !== null) {
  const id = m[1];
  urls.push(`  <url>
    <loc>https://volt-flow-one.vercel.app/?circuit=${id}</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync('public/sitemap.xml', sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs!`);
