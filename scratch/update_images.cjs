
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const images = [
  {
    "sku": "08060",
    "image_url": "https://www.stanley1913.com.br/cdn/shop/files/285279-1_500x.jpg?v=1719250518"
  },
  {
    "sku": "08163",
    "image_url": "https://www.stanley1913.com.br/cdn/shop/files/6_3a9b5f11-c0b1-4c4c-9817-6a1a760cd776_500x.jpg?v=1722454907"
  },
  {
    "sku": "08171",
    "image_url": "https://www.stanley1913.com.br/cdn/shop/files/everyday_stainless_500x.png?v=1730203907"
  },
  {
    "sku": "08174",
    "image_url": "https://www.stanley1913.com.br/cdn/shop/files/285216-12_500x.jpg?v=1773430299"
  },
  {
    "sku": "08176",
    "image_url": "https://www.stanley1913.com.br/cdn/shop/files/285430-18_500x.jpg?v=1719251716"
  }
];

async function run() {
  console.log('Updating 5 product images in Supabase...');
  for (const img of images) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?sku=eq.${img.sku}`, {
      method: 'PATCH',
      headers: { 
          'apikey': SERVICE_ROLE_KEY, 
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: img.image_url })
    });
    if (res.ok) {
        console.log(`✅ Updated SKU: ${img.sku}`);
    } else {
        console.error(`❌ Failed SKU: ${img.sku}`, await res.text());
    }
  }
}

run();
