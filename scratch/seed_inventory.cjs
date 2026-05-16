
const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function run() {
  const tenantId = 'eeb741b7-8c0c-4890-b390-75a23b558977'; // Stanley

  console.log('Fetching products to seed inventory...');
  const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const products = await prodRes.json();
  console.log(`Found ${products.length} products.`);

  const inventory = [];
  const locations = ['Estoque', 'Gaveta', 'Mostruário'];

  for (const p of products) {
    for (const loc of locations) {
        // Random quantity between 0 and 50
        const qty = Math.floor(Math.random() * 50);
        if (qty > 0) {
            inventory.push({
                tenant_id: tenantId,
                product_id: p.id,
                location: loc,
                quantity: qty,
                last_updated_at: new Date().toISOString()
            });
        }
    }
  }

  console.log(`Upserting ${inventory.length} inventory records...`);
  
  // Batch in 100s
  for (let i = 0; i < inventory.length; i += 100) {
    const batch = inventory.slice(i, i + 100);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inventory`, {
        method: 'POST',
        headers: { 
            'apikey': SERVICE_ROLE_KEY, 
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(batch)
    });
    if (!res.ok) {
        console.error(`Batch ${i/100} Error:`, await res.text());
    } else {
        console.log(`Batch ${i/100} uploaded.`);
    }
  }
}

run();
