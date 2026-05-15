
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://jqqfphjkopkcoxxfmman.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ROOT_DIR = 'g:/Meu Drive/1. Profissional & Carreira/01. Projetos Ativos/SARK_Archive/SarK/Projetos/EasyNumbers';
const STANLEY_DIR = path.join(ROOT_DIR, 'Stanley');

async function getTenantId(slug) {
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data.id;
}

function parseCsv(filePath, delimiter = ',') {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

async function integrate() {
  try {
    const tenantId = await getTenantId('stanley');
    console.log(`Integrating data for tenant: ${tenantId}`);

    // 1. Sellers
    console.log('Importing sellers...');
    const sellersCsv = parseCsv(path.join(ROOT_DIR, 'vendedores.csv'));
    const sellers = sellersCsv.map(s => ({
      tenant_id: tenantId,
      name: s.name,
      external_id: s.external_id,
      email: s.email
    }));
    await supabase.from('sellers').upsert(sellers, { onConflict: 'tenant_id,external_id' });

    // 2. Clients
    console.log('Importing clients...');
    const clientsCsv = parseCsv(path.join(ROOT_DIR, 'clientes.csv'));
    const clients = clientsCsv.map(c => ({
      tenant_id: tenantId,
      name: c.name,
      external_id: c.external_id,
      email: c.email,
      phone: c.phone,
      city: c.city,
      last_purchase_at: c.last_purchase_at
    }));
    await supabase.from('clients').upsert(clients, { onConflict: 'tenant_id,external_id' });

    // 3. Products
    console.log('Importing products...');
    const productsCsv = parseCsv(path.join(STANLEY_DIR, 'listagemprodutos.csv'), ';');
    const products = productsCsv.map(p => ({
      tenant_id: tenantId,
      sku: p['Referencia Aux.'] || p['Codigo de barra'],
      name: p['Descricao'],
      barcode: p['Codigo de barra'],
      qty: parseInt(p['Estoque']) || 0,
      price: parseFloat(p['Vlr Venda']?.replace(',', '.')) || 0,
      status: (parseInt(p['Estoque']) || 0) > 0 ? 'ESTOQUE' : 'FALTA',
      location: 'Loja Principal'
    }));
    await supabase.from('products').upsert(products, { onConflict: 'tenant_id,sku' });

    // 4. Sales Orders
    console.log('Importing sales orders...');
    const ordersCsv = parseCsv(path.join(ROOT_DIR, 'vendas.csv'));
    const orders = ordersCsv.map(o => ({
      tenant_id: tenantId,
      order_number: o.order_number,
      client_external_id: o.client_external_id,
      seller_external_id: o.seller_external_id,
      status: o.status,
      total_amount: parseFloat(o.total_amount),
      sold_at: o.sold_at
    }));
    await supabase.from('sales_orders').upsert(orders, { onConflict: 'tenant_id,order_number' });

    // 5. Sales Items
    console.log('Importing sales items...');
    const itemsCsv = parseCsv(path.join(ROOT_DIR, 'itens_venda.csv'));
    const items = itemsCsv.map(i => ({
      tenant_id: tenantId,
      order_number: i.order_number,
      sku: i.sku,
      qty: parseInt(i.qty),
      unit_price: parseFloat(i.unit_price),
      total_price: parseFloat(i.total_price)
    }));
    await supabase.from('sales_items').upsert(items, { onConflict: 'tenant_id,order_number,sku' });

    console.log('Integration completed successfully!');
  } catch (err) {
    console.error('Integration failed:', err);
  }
}

integrate();
