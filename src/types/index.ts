export type AuthMode = 'signin' | 'reset';

export interface Product {
	id: string;
	name: string;
	sku: string;
	barcode?: string;
	status: string;
	location: string;
	qty: number;
	min?: number;
	price?: number;
	totalSold?: number;
	image?: string;
	externalUrl?: string;
}

export interface CategorySale {
	name: string;
	venda: number;
	custo: number;
	share: number;
}

export interface HistoryItem {
	month: string;
	value: number;
	quantity?: number;
}

export interface Client {
	id: string;
	externalId?: string;
	nome: string;
	cidade: string;
	telefone?: string;
	ultimaCompra: string;
}

export interface Seller {
	id: string;
	externalId?: string;
	nome: string;
	itens: number;
	bruto: number;
	liquido: number;
	boletos: number;
}

export interface KPIs {
	faturamento: number;
	totalCusto: number;
	quantidadeTotal: number;
	produtosDistintos: number;
}

export interface UserPermissions {
	menus: string[];
	actions: string[];
	locations?: string[];
}

export interface UserMembership {
	tenant_id: string;
	user_id: string;
	role: 'admin' | 'manager' | 'operator';
	email?: string;
	permissions?: UserPermissions;
	created_at?: string;
}

export interface FranchiseLocation {
	id: string;
	tenant_id: string;
	slug: string;
	name: string;
	location_name: string;
	whatsapp_number: string;
	telegram_username?: string;
	address: string;
	maps_url: string;
	instagram_handle?: string;
	working_hours: string;
	created_at?: string;
	updated_at?: string;
}
