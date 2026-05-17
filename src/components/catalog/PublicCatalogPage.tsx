import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFranchiseBySlug, fetchFranchiseProducts } from '../../services/locationService';
import { FranchiseLocation, Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPhone, FiMapPin, FiClock, FiInstagram, FiShoppingCart, FiX, FiCheck, FiArrowRight } from 'react-icons/fi';

const PublicCatalogPage = () => {
	const { slug } = useParams<{ slug: string }>();

	const [franchise, setFranchise] = useState<FranchiseLocation | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Search & filters
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('Todos');

	// Modal detail view
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [purchaseQty, setPurchaseQty] = useState(1);

	useEffect(() => {
		const loadData = async () => {
			if (!slug) return;
			setLoading(true);
			setError(null);
			try {
				const loc = await getFranchiseBySlug(slug);
				if (!loc) {
					setError('Loja / Franquia não encontrada.');
					setLoading(false);
					return;
				}
				setFranchise(loc);

				// Fetch products of this franchise's location_name
				const prods = await fetchFranchiseProducts(loc.tenant_id, loc.location_name);
				// Sort: show products with stock first
				prods.sort((a, b) => b.qty - a.qty);
				setProducts(prods);
				setFilteredProducts(prods);
			} catch (err) {
				console.error('Error loading public catalog:', err);
				setError('Erro ao carregar catálogo de produtos.');
			} finally {
				setLoading(false);
			}
		};
		void loadData();
	}, [slug]);

	// Filter products on search or category change
	useEffect(() => {
		let result = [...products];

		// Category filter
		if (activeCategory !== 'Todos') {
			result = result.filter(p => {
				const name = p.name.toLowerCase();
				if (activeCategory === 'Canecas') return name.includes('caneca') || name.includes('mug');
				if (activeCategory === 'Copos') return name.includes('copo') || name.includes('tumbler') || name.includes('pint');
				if (activeCategory === 'Garrafas') return name.includes('garrafa') || name.includes('bottle') || name.includes('growler') || name.includes('ampola');
				if (activeCategory === 'Acessórios') return !name.includes('caneca') && !name.includes('mug') && !name.includes('copo') && !name.includes('tumbler') && !name.includes('pint') && !name.includes('garrafa') && !name.includes('bottle');
				return true;
			});
		}

		// Search filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
		}

		setFilteredProducts(result);
	}, [searchQuery, activeCategory, products]);

	// CTA pre-formatted WhatsApp link
	const getWhatsAppLink = (prod: Product, qty: number) => {
		if (!franchise) return '#';
		const cleanPhone = franchise.whatsapp_number.replace(/\D/g, '');
		const message = `Olá! Estava navegando no catálogo da loja *${franchise.name}* e gostaria de garantir o produto:\n\n*${prod.name}*\n📦 *Quantidade:* ${qty}x\n🏷️ *SKU:* ${prod.sku}\n💰 *Preço:* R$ ${(prod.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
		return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
	};

	// CTA pre-formatted Telegram link
	const getTelegramLink = (prod: Product, qty: number) => {
		if (!franchise?.telegram_username) return '#';
		const message = `Olá! Estava navegando no catálogo da loja *${franchise.name}* e gostaria de garantir o produto:\n\n*${prod.name}*\n📦 *Quantidade:* ${qty}x\n🏷️ *SKU:* ${prod.sku}\n💰 *Preço:* R$ ${(prod.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
		return `https://t.me/${franchise.telegram_username}?text=${encodeURIComponent(message)}`;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0a0a0c] text-[#f3f4f6] flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
					<div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground animate-pulse">
						Carregando Stanley Original...
					</div>
				</div>
			</div>
		);
	}

	if (error || !franchise) {
		return (
			<div className="min-h-screen bg-[#0a0a0c] text-[#f3f4f6] flex items-center justify-center p-6">
				<div className="max-w-md w-full text-center space-y-6 rounded-[2rem] border border-border/20 bg-card p-8 shadow-2xl">
					<div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500 text-3xl">
						<FiX />
					</div>
					<div>
						<h1 className="text-xl font-bold tracking-tight text-foreground">Acesso Inválido</h1>
						<p className="text-sm text-muted-foreground mt-2">
							{error || 'Não conseguimos carregar este catálogo digital.'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const categories = ['Todos', 'Copos', 'Canecas', 'Garrafas', 'Acessórios'];

	return (
		<div className="min-h-screen bg-[#0c0c0e] text-[#f3f4f6] font-sans selection:bg-[#d4af37] selection:text-[#0c0c0e] overflow-x-hidden">
			{/* Top Announcement Bar */}
			<div className="bg-[#12231e] text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.25em] py-2.5 text-center px-4 border-b border-[#1b342d]">
				✨ Catálogo Exclusivo Oficial — Estoque 100% Atualizado da Franquia
			</div>

			{/* Premium Header */}
			<header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-border/10 py-5 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="flex flex-col">
						<div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">
							Franquia Stanley
						</div>
						<h1 className="text-lg font-bold tracking-tight text-foreground">{franchise.name}</h1>
					</div>
				</div>
				<div className="flex items-center gap-4 text-xs">
					<a
						href={franchise.maps_url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
					>
						<FiMapPin className="text-[#d4af37]" />
						<span className="max-w-[200px] truncate">{franchise.address}</span>
					</a>
				</div>
			</header>

			{/* Hero / CTA Traffic Section */}
			<div className="relative py-20 px-6 sm:px-12 bg-gradient-to-b from-[#101f1a] to-[#0c0c0e] border-b border-border/10">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d352e]/30 via-transparent to-transparent pointer-events-none" />
				<div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]"
					>
						<FiShoppingCart /> Pronto Entrega & Prontos para Retirada
					</motion.div>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground leading-[0.95]"
					>
						Leve a Legenda <br className="sm:hidden" />
						<span className="text-[#d4af37]">com Você</span>
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto"
					>
						Explore os copos, canecas e garrafas térmicas Stanley originais. Garanta os seus agora via WhatsApp com retirada na hora ou entrega rápida!
					</motion.p>

					{/* Fast Header Store Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="flex flex-wrap items-center justify-center gap-3 pt-2"
					>
						<a
							href={`https://api.whatsapp.com/send?phone=${franchise.whatsapp_number.replace(/\D/g, '')}&text=Ol%C3%A1!%20Vim%20pelo%20cat%C3%A1logo%20online%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-98"
						>
							<FiPhone /> Falar com Vendedor
						</a>
						<a
							href={franchise.maps_url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-muted hover:border-foreground transition-all hover:-translate-y-0.5 active:translate-y-0"
						>
							<FiMapPin className="text-[#d4af37]" /> Como Chegar
						</a>
					</motion.div>
				</div>
			</div>

			{/* Main Catalog Search & Filter Controls */}
			<div className="max-w-7xl mx-auto py-10 px-6 sm:px-12 space-y-8">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					{/* Search */}
					<div className="relative flex-1 max-w-md w-full">
						<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-full rounded-full border border-border/30 bg-[#121215] py-3.5 pl-12 pr-6 text-sm outline-none focus:border-[#d4af37]/50 focus:bg-[#16161a] transition-all"
							placeholder="Buscar copo, caneca, cor..."
						/>
					</div>

					{/* Categories */}
					<div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
						{categories.map(cat => (
							<button
								key={cat}
								onClick={() => setActiveCategory(cat)}
								className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all ${
									activeCategory === cat
										? 'bg-[#d4af37] text-[#0c0c0e] shadow-lg shadow-[#d4af37]/20 scale-105'
										: 'bg-[#121215] border border-border/20 text-muted-foreground hover:text-foreground hover:border-border/50'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Products Grid */}
				<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					<AnimatePresence mode="popLayout">
						{filteredProducts.map(prod => {
							const hasStock = prod.qty > 0;
							const isLowStock = hasStock && prod.qty < 5;

							return (
								<motion.div
									key={prod.id}
									layout
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.3 }}
									whileHover={{ y: -6 }}
									onClick={() => {
										setSelectedProduct(prod);
										setPurchaseQty(1);
									}}
									className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl border border-border/20 bg-[#121215]/80 backdrop-blur-sm p-5 hover:border-[#d4af37]/30 transition-all shadow-xl shadow-black/30"
								>
									<div>
										{/* Badge status */}
										<div className="flex items-center justify-between mb-4">
											{hasStock ? (
												isLowStock ? (
													<span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">
														Últimas Unidades
													</span>
												) : (
													<span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
														Pronta Entrega
													</span>
												)
											) : (
												<span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400">
													Sob Encomenda
												</span>
											)}
											<span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">
												{prod.sku}
											</span>
										</div>

										{/* Product image container */}
										<div className="relative aspect-square overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center p-4">
											{prod.image ? (
												<img
													src={prod.image}
													alt={prod.name}
													className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="text-muted-foreground text-[10px] uppercase font-semibold tracking-widest">
													Stanley Original
												</div>
											)}
										</div>

										{/* Content */}
										<h3 className="mt-4 text-sm font-bold tracking-tight text-foreground line-clamp-2 leading-tight group-hover:text-[#d4af37] transition-colors">
											{prod.name}
										</h3>
									</div>

									<div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-between">
										<div>
											<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
												Preço Especial
											</div>
											<div className="text-base font-extrabold text-foreground">
												{prod.price ? (
													`R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
												) : (
													<span className="text-xs text-muted-foreground font-semibold">Sob consulta</span>
												)}
											</div>
										</div>

										<div className="rounded-full bg-primary/10 p-2.5 text-primary group-hover:bg-[#d4af37] group-hover:text-[#0c0c0e] transition-all">
											<FiShoppingCart className="text-sm" />
										</div>
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>

					{filteredProducts.length === 0 && (
						<div className="col-span-full py-20 text-center text-muted-foreground space-y-2">
							<p className="text-sm font-semibold">Nenhum produto encontrado nesta busca.</p>
							<p className="text-xs opacity-60">Tente buscar por termos diferentes ou selecione outra categoria.</p>
						</div>
					)}
				</motion.div>
			</div>

			{/* Interactive Product Details & Action Modal */}
			<AnimatePresence>
				{selectedProduct && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedProduct(null)}
							className="absolute inset-0 bg-black/80 backdrop-blur-md"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-border/20 bg-[#121215] p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
						>
							<button
								onClick={() => setSelectedProduct(null)}
								className="absolute right-6 top-6 rounded-full border border-border/10 bg-black/35 p-2 hover:bg-muted transition-colors"
							>
								<FiX className="text-xl" />
							</button>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
								{/* Image */}
								<div className="aspect-square bg-black/45 rounded-3xl p-4 flex items-center justify-center relative">
									{selectedProduct.image ? (
										<img
											src={selectedProduct.image}
											alt={selectedProduct.name}
											className="max-h-full max-w-full object-contain"
										/>
									) : (
										<div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
											Stanley Original
										</div>
									)}
								</div>

								{/* Info */}
								<div className="flex flex-col justify-between space-y-4">
									<div>
										<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
											SKU {selectedProduct.sku}
										</span>
										<h2 className="text-lg font-black tracking-tight text-foreground mt-1 uppercase leading-tight">
											{selectedProduct.name}
										</h2>

										<div className="mt-3 flex flex-wrap gap-2">
											{selectedProduct.qty > 0 ? (
												<span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
													Em Estoque ({selectedProduct.qty} un)
												</span>
											) : (
												<span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400">
													Sem Estoque Físico
												</span>
											)}
										</div>
									</div>

									<div>
										<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
											Valor Unitário
										</div>
										<div className="text-2xl font-black text-[#d4af37]">
											{selectedProduct.price ? (
												`R$ ${selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
											) : (
												<span className="text-sm text-muted-foreground font-semibold">Sob consulta</span>
											)}
										</div>
									</div>

									{/* Quantity selector */}
									{selectedProduct.qty > 0 && (
										<div className="space-y-1.5">
											<label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
												Quantidade
											</label>
											<div className="flex items-center border border-border/30 rounded-xl max-w-[120px] bg-black/30 overflow-hidden">
												<button
													type="button"
													onClick={() => setPurchaseQty(q => Math.max(1, q - 1))}
													className="px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/30"
												>
													-
												</button>
												<span className="flex-1 text-center font-bold text-sm text-foreground">
													{purchaseQty}
												</span>
												<button
													type="button"
													onClick={() => setPurchaseQty(q => Math.min(selectedProduct.qty, q + 1))}
													className="px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/30"
												>
													+
												</button>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Call to Actions */}
							<div className="pt-6 mt-6 border-t border-border/10 space-y-2">
								<a
									href={getWhatsAppLink(selectedProduct, purchaseQty)}
									target="_blank"
									rel="noopener noreferrer"
									className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-500 transition-all active:scale-98"
								>
									<FiPhone /> Garantir no WhatsApp
								</a>

								{franchise.telegram_username && (
									<a
										href={getTelegramLink(selectedProduct, purchaseQty)}
										target="_blank"
										rel="noopener noreferrer"
										className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-transparent px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-all active:scale-98"
									>
										Reservar via Telegram
									</a>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Footer / Store Details Section */}
			<footer className="bg-[#08080a] border-t border-border/10 py-16 px-6 sm:px-12 text-muted-foreground text-xs relative">
				<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
							Sobre a Franquia
						</div>
						<h4 className="text-sm font-bold text-foreground">{franchise.name}</h4>
						<p className="leading-relaxed opacity-75 max-w-sm">
							Esta página é um catálogo digital oficial da franquia Stanley. Todos os preços e níveis de estoque exibidos são consultados em tempo real através do CIGAM ERP da loja.
						</p>
					</div>

					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
							Horários & Endereço
						</div>
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<FiMapPin className="mt-0.5 text-primary" />
								<span className="leading-relaxed">{franchise.address}</span>
							</div>
							<div className="flex items-center gap-2">
								<FiClock className="text-primary" />
								<span>{franchise.working_hours}</span>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">
							Contato & Redes Sociais
						</div>
						<div className="space-y-2.5">
							<div className="flex items-center gap-2">
								<FiPhone className="text-emerald-500" />
								<span className="text-foreground font-semibold">{franchise.whatsapp_number}</span>
							</div>
							{franchise.instagram_handle && (
								<a
									href={`https://instagram.com/${franchise.instagram_handle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 hover:text-[#d4af37] transition-colors"
								>
									<FiInstagram className="text-pink-500" />
									<span>@{franchise.instagram_handle}</span>
								</a>
							)}
						</div>
					</div>
				</div>

				<div className="max-w-6xl mx-auto pt-10 mt-10 border-t border-border/10 text-center opacity-50 text-[10px] uppercase tracking-widest">
					Made with ❤️ by Sark — Stanley Portal © {new Date().getFullYear()}
				</div>
			</footer>
		</div>
	);
};

export default PublicCatalogPage;
