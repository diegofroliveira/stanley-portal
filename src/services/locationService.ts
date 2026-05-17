import { supabase } from '../lib/supabaseClient';
import { FranchiseLocation, Product } from '../types';

export async function getFranchiseBySlug(slug: string): Promise<FranchiseLocation | null> {
	const { data, error } = await supabase
		.from('franchise_locations')
		.select('*')
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.error('Error fetching franchise by slug:', error);
		return null;
	}
	return data;
}

export async function listFranchises(tenantId: string): Promise<FranchiseLocation[]> {
	const { data, error } = await supabase
		.from('franchise_locations')
		.select('*')
		.eq('tenant_id', tenantId)
		.order('created_at', { ascending: true });

	if (error) throw error;
	return data || [];
}

export async function upsertFranchise(location: Partial<FranchiseLocation>): Promise<FranchiseLocation> {
	const { data, error } = await supabase
		.from('franchise_locations')
		.upsert(location)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteFranchise(id: string): Promise<void> {
	const { error } = await supabase
		.from('franchise_locations')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

export async function fetchFranchiseProducts(tenantId: string, locationName: string): Promise<Product[]> {
	const { data, error } = await supabase
		.from('products')
		.select('*')
		.eq('tenant_id', tenantId)
		.eq('location', locationName);

	if (error) throw error;
	if (!data?.length) return [];

	return (data as Record<string, unknown>[]).map((row) => {
		const str = (...keys: string[]) => {
			for (const key of keys) {
				const value = row[key];
				if (typeof value === 'string' && value.trim()) return value.trim();
				if (typeof value === 'number') return String(value);
			}
			return '';
		};

		const num = (...keys: string[]) => {
			const value = str(...keys);
			const parsed = Number(value);
			return Number.isFinite(parsed) ? parsed : undefined;
		};

		const currency = (...keys: string[]) => {
			const value = str(...keys);
			if (!value) return undefined;
			const parsed = Number(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
			return Number.isFinite(parsed) ? parsed : undefined;
		};

		return {
			id: str('id') || str('sku') || crypto.randomUUID(),
			name: str('name', 'descricao', 'Descrição'),
			sku: str('sku', 'SKU') || '—',
			barcode: str('barcode', 'Barcode', 'BARCODE', 'codigo_barras') || undefined,
			status: str('status', 'Status') || 'ESTOQUE',
			location: str('location', 'local', 'Local') || 'Loja principal',
			qty: num('qty', 'quantidade_estoque', 'Quantidade_Estoque', 'total_estoque', 'Total_Estoque') ?? 0,
			min: num('min', 'estoque_minimo', 'Estoque_Minimo') ?? undefined,
			price: num('price') ?? currency('preco_venda', 'Preço de Venda Normal') ?? undefined,
			totalSold: num('total_sold') ?? undefined,
			image: str('image_url', 'image', 'foto', 'Foto') || undefined,
			externalUrl: str('external_url', 'product_url', 'url_produto', 'link', 'link_produto') || undefined,
		};
	});
}
