
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function scrapeBatch() {
  console.log('Fetching products that need images...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?image=is.null&limit=50&select=id,sku`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const products = await res.json();
  
  if (!products || products.length === 0) {
    console.log('No more products to scrape.');
    return;
  }

  console.log(`Scraping batch of ${products.length} products...`);

  for (const p of products) {
    try {
      console.log(`🔍 Searching for SKU: ${p.sku}...`);
      const searchRes = await fetch(`https://www.stanley1913.com.br/search?q=${p.sku}`);
      const html = await searchRes.text();
      
      // Regex to find shopify file images
      const match = html.match(/\/\/www\.stanley1913\.com\.br\/cdn\/shop\/files\/[^"]+_[0-9]+x\.(?:jpg|png|webp)/i);
      
      if (match) {
        const imgUrl = 'https:' + match[0];
        console.log(`✅ Found: ${imgUrl}`);
        
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`, {
          method: 'PATCH',
          headers: { 
              'apikey': SERVICE_ROLE_KEY, 
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: imgUrl })
        });
      } else {
        console.log(`⚠️ No image found for SKU: ${p.sku}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`❌ Error scraping ${p.sku}:`, err.message);
    }
  }
}

scrapeBatch();
