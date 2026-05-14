import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type InventoryRow = {
  id: string;
  location: string;
  quantity: number;
  last_updated_at: string;
  products: {
    id: string;
    sku: string;
    name: string;
    barcode: string | null;
    image: string | null;
    price: number | null;
  } | null;
};

type GroupedProduct = {
  product_id: string;
  sku: string;
  name: string;
  image: string | null;
  price: number | null;
  barcode: string | null;
  ESTOQUE: number;
  GAVETA: number;
  MOSTRUARIO: number;
  total: number;
  last_updated_at: string;
};

const LOCATION_LABELS: Record<string, string> = {
  ESTOQUE: 'Estoque',
  GAVETA: 'Gaveta',
  MOSTRUARIO: 'Mostruário',
};

const LOCATION_COLORS: Record<string, string> = {
  ESTOQUE: 'bg-blue-100 text-blue-800',
  GAVETA: 'bg-purple-100 text-purple-800',
  MOSTRUARIO: 'bg-green-100 text-green-800',
};

type Props = {
  tenantId: string | undefined;
  primaryColor: string;
};

const InventoryPage = ({ tenantId, primaryColor }: Props) => {
  const [inventory, setInventory] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!tenantId) return;
    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id, location, quantity, last_updated_at,
          products (id, sku, name, barcode, image, price)
        `)
        .eq('tenant_id', tenantId)
        .gt('quantity', 0)
        .order('last_updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
        return;
      }

      // Group by product
      const grouped: Record<string, GroupedProduct> = {};
      const rows = (data as any[]) || [];
      
      rows.forEach((row) => {
        // Handle both object and array response from Supabase join
        const prod = Array.isArray(row.products) ? row.products[0] : row.products;
        if (!prod) return;
        
        if (!grouped[prod.id]) {
          grouped[prod.id] = {
            product_id: prod.id,
            sku: prod.sku,
            name: prod.name,
            image: prod.image,
            price: prod.price,
            barcode: prod.barcode,
            ESTOQUE: 0,
            GAVETA: 0,
            MOSTRUARIO: 0,
            total: 0,
            last_updated_at: row.last_updated_at,
          };
        }
        
        const loc = row.location as string;
        if (loc === 'ESTOQUE') grouped[prod.id].ESTOQUE = row.quantity;
        else if (loc === 'GAVETA') grouped[prod.id].GAVETA = row.quantity;
        else if (loc === 'MOSTRUARIO') grouped[prod.id].MOSTRUARIO = row.quantity;
        
        grouped[prod.id].total += row.quantity;
        if (row.last_updated_at > grouped[prod.id].last_updated_at) {
          grouped[prod.id].last_updated_at = row.last_updated_at;
        }
      });

      setInventory(Object.values(grouped).sort((a, b) => b.total - a.total));
      setLoading(false);
    };

    void fetchInventory();
  }, [tenantId]);

  const filtered = inventory.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? '').includes(search);
    const matchLocation =
      locationFilter === 'ALL' ||
      (locationFilter === 'ESTOQUE' && p.ESTOQUE > 0) ||
      (locationFilter === 'GAVETA' && p.GAVETA > 0) ||
      (locationFilter === 'MOSTRUARIO' && p.MOSTRUARIO > 0);
    return matchSearch && matchLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" />
          <span className="text-sm">Carregando estoque...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome, SKU ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 flex-1 min-w-[200px] rounded-full border border-border/50 bg-muted px-4 text-sm outline-none focus:border-ring/60 focus:ring-1 focus:ring-ring/20"
        />
        <div className="inline-flex rounded-full bg-muted p-1 text-xs font-medium uppercase tracking-[0.2em]">
          {(['ALL', 'ESTOQUE', 'GAVETA', 'MOSTRUARIO'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocationFilter(loc)}
              className={`rounded-full px-3 py-1.5 transition ${
                locationFilter === loc
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {loc === 'ALL' ? 'Todos' : LOCATION_LABELS[loc]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {(['ESTOQUE', 'GAVETA', 'MOSTRUARIO'] as const).map((loc) => {
          const total = inventory.reduce((sum, p) => {
            if (loc === 'ESTOQUE') return sum + p.ESTOQUE;
            if (loc === 'GAVETA') return sum + p.GAVETA;
            if (loc === 'MOSTRUARIO') return sum + p.MOSTRUARIO;
            return sum;
          }, 0);
          return (
            <div
              key={loc}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${LOCATION_COLORS[loc]}`}
            >
              {LOCATION_LABELS[loc]}: {total} un.
            </div>
          );
        })}
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Total: {inventory.reduce((s, p) => s + p.total, 0)} un.
        </div>
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <span className="text-4xl">📦</span>
          <p className="text-sm">Nenhum produto encontrado no estoque.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/30">
          <table className="w-full text-sm">
            <thead className="border-b border-border/30 bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estoque</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Gaveta</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Mostruário</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map((p) => (
                <tr key={p.product_id} className="group transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover border border-border/30"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-lg">
                          📦
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block min-w-[2rem] rounded-full px-2 py-0.5 text-xs font-semibold ${p.ESTOQUE > 0 ? 'bg-blue-100 text-blue-800' : 'text-muted-foreground'}`}>
                      {p.ESTOQUE}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block min-w-[2rem] rounded-full px-2 py-0.5 text-xs font-semibold ${p.GAVETA > 0 ? 'bg-purple-100 text-purple-800' : 'text-muted-foreground'}`}>
                      {p.GAVETA}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block min-w-[2rem] rounded-full px-2 py-0.5 text-xs font-semibold ${p.MOSTRUARIO > 0 ? 'bg-green-100 text-green-800' : 'text-muted-foreground'}`}>
                      {p.MOSTRUARIO}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">
                    {p.total}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.price != null
                      ? p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
