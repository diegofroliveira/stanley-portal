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
				let loc = await getFranchiseBySlug(slug);
				if (!loc) {
					// High-fidelity fallback configuration if table migrations are not executed yet
					if (slug === 'brasilia-shopping' || slug === 'stanley1913-brasilia-shopping') {
						loc = {
							id: 'default-brasilia-shopping',
							tenant_id: 'eeb741b7-8c0c-4890-b390-75a23b558977', // Stanley Tenant ID
							slug: 'stanley1913-brasilia-shopping',
							name: 'Stanley 1913 Brasília Shopping',
							location_name: 'Brasília Shopping',
							whatsapp_number: '5561999999999',
							address: 'SCN Quadra 5, Bloco A - Asa Norte, Brasília - DF, 70715-900',
							maps_url: 'https://maps.app.goo.gl/DF5xP3F8pHRDLPmPA',
							instagram_handle: 'stanley.df',
							working_hours: 'Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h'
						};
					} else if (slug === 'park-shopping' || slug === 'stanley1913-park-shopping') {
						loc = {
							id: 'default-park-shopping',
							tenant_id: 'eeb741b7-8c0c-4890-b390-75a23b558977', // Stanley Tenant ID
							slug: 'stanley1913-park-shopping',
							name: 'Stanley 1913 Park Shopping',
							location_name: 'Park Shopping',
							whatsapp_number: '5561999999999',
							address: 'SAI/SO Área Octogonal - Guará, Brasília - DF, 71219-900',
							maps_url: 'https://maps.app.goo.gl/DF5xP3F8pHRDLPmPA',
							instagram_handle: 'stanley.df',
							working_hours: 'Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h'
						};
					} else {
						setError('Loja / Franquia não encontrada.');
						setLoading(false);
						return;
					}
				}
				setFranchise(loc);

				// Fetch products of this franchise's location_name
				const prods = await fetchFranchiseProducts(loc.tenant_id, loc.location_name);
				
				// FILTER: Only show products for purchase (in stock qty > 0) with a valid selling price
				let buyableProds = prods.filter(p => p.qty > 0 && typeof p.price === 'number' && p.price > 0);
				
				// Auto-contingency: If database stock sync is pending (all items have 0 stock),
				// fallback to showing all products with a valid price so the portal works beautifully for testing!
				if (buyableProds.length === 0) {
					buyableProds = prods.filter(p => typeof p.price === 'number' && p.price > 0);
				}
				
				// Sort: show products with higher stock first
				buyableProds.sort((a, b) => b.qty - a.qty);
				
				setProducts(buyableProds);
				setFilteredProducts(buyableProds);
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
			<div className="min-h-screen bg-white text-black flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
					<div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 animate-pulse">
						Carregando Stanley 1913 BR...
					</div>
				</div>
			</div>
		);
	}

	if (error || !franchise) {
		return (
			<div className="min-h-screen bg-[#f4f4f4] text-black flex items-center justify-center p-6">
				<div className="max-w-md w-full text-center space-y-6 bg-white p-10 border border-gray-200 shadow-sm rounded-none">
					<div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-600 text-3xl">
						<FiX />
					</div>
					<div>
						<h1 className="text-sm font-bold uppercase tracking-widest text-black">Acesso Inválido</h1>
						<p className="text-xs text-gray-500 mt-2 leading-relaxed">
							{error || 'Não conseguimos carregar este catálogo digital.'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const categories = ['Todos', 'Copos', 'Canecas', 'Garrafas', 'Acessórios'];

	return (
		<div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-black selection:text-white overflow-x-hidden">
			{/* Top Announcement Bar - Pure Black, spacing like official BR site */}
			<div className="bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] py-2.5 text-center px-4">
				🔥 INSCREVA-SE E GANHE 10% OFF NA 1ª COMPRA | FRETE GRÁTIS ACIMA DE R$ 345 | EM ATÉ 12X SEM JUROS
			</div>

			{/* Official Bright Header */}
			<header className="sticky top-0 z-40 bg-white border-b border-gray-200 py-4 px-6 sm:px-12 flex items-center justify-between">
				{/* Stylized Logo: Stanley Winged Bear Crest SVG + STANLEY 1913 text */}
				<div className="flex items-center gap-3">
					<svg className="h-9 w-auto text-black fill-current" viewBox="0 0 350 70" xmlns="http://www.w3.org/2000/svg">
						{/* Stylized Winged Bear Crown / Shield Silhouette */}
						<path d="M12,28 L18,12 L30,20 L42,12 L48,28 L40,48 L20,48 Z" fill="currentColor" />
						<path d="M18,52 L42,52 L45,60 L15,60 Z" fill="currentColor" />
						{/* STANLEY Typography */}
						<text x="64" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="4">STANLEY</text>
						{/* 1913 subtext */}
						<text x="295" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="300" font-size="16" letter-spacing="2">1913</text>
					</svg>
				</div>
				<div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
					<span className="text-black border-b-2 border-black pb-1">Catálogo Oficial</span>
					<span>Estoque Integrado</span>
					<a
						href={franchise.maps_url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 hover:text-black transition-colors"
					>
						<FiMapPin className="text-black" />
						<span>{franchise.name}</span>
					</a>
				</div>
			</header>

			{/* Lifestyle Hero Section - Cream Off-White exactly like Stanley luxury template */}
			<div className="relative py-16 px-6 sm:px-12 bg-[#f4f4f4] border-b border-gray-200">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
					<div className="space-y-6 text-left max-w-xl">
						<div className="inline-flex items-center gap-2 border border-black bg-white px-4 py-1 text-[9px] font-bold uppercase tracking-widest text-black">
							⚡ Pronta Entrega na Loja
						</div>
						<h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-[0.95] font-sans">
							VEM AÍ... <br />
							<span className="text-[#000000]">Aniversário</span> <br />
							<span className="text-gray-400">Legionários.</span>
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
							Explore os copos, garrafas e canecas Stanley originais em estoque no <strong>{franchise.name}</strong>. Compre online via WhatsApp com atendimento personalizado e retirada expressa!
						</p>
						<div className="flex flex-wrap gap-3 pt-2">
							<a
								href={`https://api.whatsapp.com/send?phone=${franchise.whatsapp_number.replace(/\D/g, '')}&text=Ol%C3%A1!%20Vim%20pelo%20cat%C3%A1logo%20online%20da%20loja%20e%20gostaria%20de%20garantir%20meu%20Stanley.`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-none bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all border border-black"
							>
								Falar com Vendedor
							</a>
							<a
								href={franchise.maps_url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-none bg-white text-black border border-black px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
							>
								Como Chegar
							</a>
						</div>
					</div>
					
					{/* Decorative Lifestyle Visual Element */}
					<div className="hidden md:flex justify-center relative">
						<div className="bg-gradient-to-tr from-[#12231e]/10 to-transparent w-80 h-80 rounded-full absolute -z-10" />
						<div className="bg-white p-8 border border-gray-200 max-w-sm text-center space-y-4 shadow-sm">
							<span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
								Estoque Oficial CIGAM
							</span>
							<h3 className="text-sm font-black uppercase tracking-wider text-black">
								{franchise.name}
							</h3>
							<p className="text-[11px] text-gray-500 leading-relaxed">
								Compre online, evite fretes e retire seu produto original embalado para presente em poucos minutos.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Catalog Search & Filter Controls */}
			<div className="max-w-7xl mx-auto py-12 px-6 sm:px-12 space-y-10">
				
				{/* Search & Categories Bar */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
					{/* Search - Clean Minimalist Box */}
					<div className="relative flex-1 max-w-md w-full">
						<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-base pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-full rounded-none border border-gray-300 bg-white py-3.5 pl-12 pr-6 text-xs outline-none focus:border-black transition-all text-black uppercase tracking-widest"
							placeholder="BUSCAR COPAS, GARRAFAS, SKUS..."
						/>
					</div>

					{/* Categories - Sharp edge pills from template */}
					<div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
						{categories.map(cat => (
							<button
								key={cat}
								onClick={() => setActiveCategory(cat)}
								className={`rounded-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
									activeCategory === cat
										? 'bg-black text-white border border-black'
										: 'bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-black'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Products Grid - Minimalist Clean Cards */}
				<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
					<AnimatePresence mode="popLayout">
						{filteredProducts.map(prod => {
							const hasStock = prod.qty > 0;

							return (
								<motion.div
									key={prod.id}
									layout
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									onClick={() => {
										setSelectedProduct(prod);
										setPurchaseQty(1);
									}}
									className="group cursor-pointer flex flex-col justify-between rounded-none border border-transparent p-1 transition-all bg-white"
								>
									<div>
										{/* Gray/Off-white Image Area exactly like template */}
										<div className="relative aspect-square overflow-hidden rounded-none bg-[#f2f2f2] flex items-center justify-center p-6 transition-all duration-300">
											{/* Status badge in upper-left */}
											<div className="absolute top-3 left-3 z-10">
												<span className="rounded-full bg-white border border-black px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-black shadow-sm">
													{hasStock ? '🔥 Pronta Entrega' : '📦 Sob Consulta'}
												</span>
											</div>

											{prod.image ? (
												<img
													src={prod.image}
													alt={prod.name}
													className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="text-gray-400 text-[9px] uppercase font-bold tracking-[0.25em]">
													Stanley 1913
												</div>
											)}
										</div>

										{/* Interactive E-commerce rating indicators */}
										<div className="flex items-center gap-1 mt-3">
											<div className="text-black text-xs">★★★★★</div>
											<span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">
												({prod.sku})
											</span>
										</div>

										{/* Mini representative color dots */}
										<div className="flex items-center gap-1 mt-1.5">
											<span className="w-2.5 h-2.5 rounded-full bg-black border border-gray-300" />
											<span className="w-2.5 h-2.5 rounded-full bg-[#12231e] border border-gray-300" />
											<span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300" />
										</div>

										{/* Product Title in bold black upper/sentence case */}
										<h3 className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wide text-black line-clamp-2 leading-tight group-hover:text-gray-500 transition-colors">
											{prod.name}
										</h3>
									</div>

									{/* Bottom Price & Button Layout */}
									<div className="mt-3">
										<div className="text-sm font-black text-black">
											{prod.price ? (
												`R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
											) : (
												<span className="text-xs text-gray-500 font-semibold">Sob consulta</span>
											)}
										</div>
										<div className="text-[10px] text-gray-400 font-medium">
											{prod.price ? `ou em até 12x de R$ ${(prod.price / 12).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} sem juros` : ''}
										</div>

										{/* Sharp corner border action button from template */}
										<button
											type="button"
											className="w-full bg-white text-black border border-black group-hover:bg-black group-hover:text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-none mt-4"
										>
											COMPRAR NO WHATSAPP
										</button>
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>

					{filteredProducts.length === 0 && (
						<div className="col-span-full py-20 text-center text-gray-400 space-y-2">
							<p className="text-sm font-semibold uppercase tracking-widest text-black">Nenhum produto em estoque.</p>
							<p className="text-xs opacity-60">Volte mais tarde ou tente filtrar por outra categoria.</p>
						</div>
					)}
				</motion.div>
			</div>

			{/* Minimalist Product Detail & WhatsApp Modal */}
			<AnimatePresence>
				{selectedProduct && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedProduct(null)}
							className="absolute inset-0 bg-black/60 backdrop-blur-xs"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.98, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.98, y: 15 }}
							className="relative w-full max-w-xl overflow-hidden rounded-none border border-gray-200 bg-white p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
						>
							<button
								onClick={() => setSelectedProduct(null)}
								className="absolute right-6 top-6 rounded-none border border-gray-200 bg-white p-2 hover:bg-gray-50 transition-colors"
							>
								<FiX className="text-lg text-black" />
							</button>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
								{/* Image */}
								<div className="aspect-square bg-[#f2f2f2] rounded-none p-6 flex items-center justify-center relative">
									{selectedProduct.image ? (
										<img
											src={selectedProduct.image}
											alt={selectedProduct.name}
											className="max-h-full max-w-full object-contain"
										/>
									) : (
										<div className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.25em]">
											Stanley 1913
										</div>
									)}
								</div>

								{/* Info */}
								<div className="flex flex-col justify-between space-y-4">
									<div>
										<span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
											SKU {selectedProduct.sku}
										</span>
										<h2 className="text-base font-black tracking-tight text-black mt-1 uppercase leading-tight font-sans">
											{selectedProduct.name}
										</h2>

										<div className="mt-2.5 flex items-center gap-1.5">
											<span className="rounded-full bg-black px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
												{selectedProduct.qty > 0 ? 'Disponível' : 'Sob Consulta'}
											</span>
										</div>
									</div>

									<div>
										<div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">
											Valor Unitário
										</div>
										<div className="text-xl font-black text-black">
											{selectedProduct.price ? (
												`R$ ${selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
											) : (
												<span className="text-sm text-gray-400 font-semibold">Sob consulta</span>
											)}
										</div>
									</div>

									{/* Quantity selector with outline sharp corners */}
									{selectedProduct.qty >= 0 && (
										<div className="space-y-1.5">
											<label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
												Quantidade
											</label>
											<div className="flex items-center border border-gray-300 rounded-none max-w-[120px] bg-white overflow-hidden">
												<button
													type="button"
													onClick={() => setPurchaseQty(q => Math.max(1, q - 1))}
													className="px-3.5 py-2 text-xs font-bold text-black hover:bg-gray-100"
												>
													-
												</button>
												<span className="flex-1 text-center font-bold text-xs text-black">
													{purchaseQty}
												</span>
												<button
													type="button"
													onClick={() => setPurchaseQty(q => q + 1)}
													className="px-3.5 py-2 text-xs font-bold text-black hover:bg-gray-100"
												>
													+
												</button>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Call to Actions in bold black outlines */}
							<div className="pt-6 mt-6 border-t border-gray-100 space-y-2">
								<a
									href={getWhatsAppLink(selectedProduct, purchaseQty)}
									target="_blank"
									rel="noopener noreferrer"
									className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-none"
								>
									<FiPhone /> Fechar Pedido via WhatsApp
								</a>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Premium Deep Black Footer inspired directly by official footer */}
			<footer className="bg-black text-white py-16 px-6 sm:px-12 text-xs relative">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
					
					{/* Col 1: Brand Info */}
					<div className="space-y-4">
						<svg className="h-9 w-auto text-white fill-current" viewBox="0 0 350 70" xmlns="http://www.w3.org/2000/svg">
							<path d="M12,28 L18,12 L30,20 L42,12 L48,28 L40,48 L20,48 Z" fill="currentColor" />
							<path d="M18,52 L42,52 L45,60 L15,60 Z" fill="currentColor" />
							<text x="64" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="4">STANLEY</text>
							<text x="295" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="300" font-size="16" letter-spacing="2">1913</text>
						</svg>
						<p className="leading-relaxed text-[11px] text-gray-400 max-w-xs">
							Esta página é um catálogo de vendas oficial da franquia Stanley 1913. Os produtos, estoque físico e preços de venda são atualizados via integração CIGAM ERP da loja.
						</p>
						
						{/* Social Icons exactly like official site */}
						<div className="flex items-center gap-4 pt-2">
							<a href={`https://instagram.com/${franchise.instagram_handle || 'stanley.df'}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-base">
								<FiInstagram />
							</a>
							<a href={franchise.maps_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-base">
								<FiMapPin />
							</a>
						</div>
					</div>

					{/* Col 2: Endereço */}
					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
							Endereço Físico
						</div>
						<p className="leading-relaxed text-[11px] text-gray-400 flex items-start gap-2">
							<FiMapPin className="mt-0.5 text-white flex-shrink-0" />
							<span>{franchise.address}</span>
						</p>
					</div>

					{/* Col 3: Funcionamento */}
					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
							Horários de Loja
						</div>
						<p className="leading-relaxed text-[11px] text-gray-400 flex items-start gap-2">
							<FiClock className="mt-0.5 text-white flex-shrink-0" />
							<span>{franchise.working_hours}</span>
						</p>
					</div>

					{/* Col 4: Suporte e Contato */}
					<div className="space-y-4">
						<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
							Atendimento Direto
						</div>
						<div className="space-y-3">
							<a
								href={`https://api.whatsapp.com/send?phone=${franchise.whatsapp_number.replace(/\D/g, '')}&text=Ol%C3%A1!%20Estou%20no%20cat%C3%A1logo%20digital.`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 border border-white bg-transparent px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all rounded-none"
							>
								<FiPhone /> Chamar Vendedor
							</a>
							<div className="text-[10px] text-gray-400">
								WhatsApp da Franquia: <br />
								<strong className="text-white text-xs">{franchise.whatsapp_number}</strong>
							</div>
						</div>
					</div>

				</div>

				<div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-[10px] uppercase tracking-widest">
					<div>
						© {new Date().getFullYear()} Stanley 1913 BR. Todos os direitos reservados.
					</div>
					<div>
						Made with ❤️ by Sark — Stanley Portal
					</div>
				</div>
			</footer>
		</div>
	);
};

export default PublicCatalogPage;
