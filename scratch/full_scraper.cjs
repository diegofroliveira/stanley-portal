
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function scrapeEverything() {
  let hasMore = true;
  let totalUpdated = 0;

  while (hasMore) {
    console.log(`\n--- Fetching batch (Total updated so far: ${totalUpdated}) ---`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?image=is.null&limit=50&select=id,sku,name`, {
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
    });
    const products = await res.json();
    
    if (!products || products.length === 0) {
      console.log('🎉 All products have images or no more found.');
      hasMore = false;
      break;
    }

    for (const p of products) {
      try {
        console.log(`🔍 Searching for SKU: ${p.sku}...`);
        let imgUrl = await findImage(p.sku);
        
        if (!imgUrl && p.name) {
          console.log(`🔍 SKU failed. Trying name: ${p.name}...`);
          imgUrl = await findImage(p.name);
        }
        
        if (imgUrl) {
          console.log(`✅ [${p.sku}] -> ${imgUrl}`);
          await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`, {
            method: 'PATCH',
            headers: { 
                'apikey': SERVICE_ROLE_KEY, 
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imgUrl })
          });
          totalUpdated++;
        } else {
          console.log(`⚠️ [${p.sku}] No image found.`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`❌ Error scraping ${p.sku}:`, err.message);
      }
    }
  }
}

async function findImage(query) {
    try {
        const searchRes = await fetch(`https://www.stanley1913.com.br/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await searchRes.text();
        const match = html.match(/\/\/www\.stanley1913\.com\.br\/cdn\/shop\/files\/[^"]+_[0-9]+x\.(?:jpg|png|webp)/i);
        return match ? 'https:' + match[0] : null;
    } catch (e) {
        return null;
    }
}

scrapeEverything();
