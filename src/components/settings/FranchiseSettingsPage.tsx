import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { listFranchises, upsertFranchise, deleteFranchise } from '../../services/locationService';
import { FranchiseLocation } from '../../types';
import { Card, Section, Title } from '../ui/Primitives';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCopy, FiCheck, FiMapPin, FiPhone, FiClock, FiInstagram } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FranchiseSettingsPage = () => {
	const { tenant } = useTenant();
	const tenantId = tenant?.id;

	const [franchises, setFranchises] = useState<FranchiseLocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<{ type: 'create' | 'edit'; location?: FranchiseLocation } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Form states
	const [formName, setFormName] = useState('');
	const [formSlug, setFormSlug] = useState('');
	const [formLocationName, setFormLocationName] = useState('');
	const [formWhatsapp, setFormWhatsapp] = useState('');
	const [formTelegram, setFormTelegram] = useState('');
	const [formAddress, setFormAddress] = useState('');
	const [formMapsUrl, setFormMapsUrl] = useState('');
	const [formInstagram, setFormInstagram] = useState('');
	const [formWorkingHours, setFormWorkingHours] = useState('Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h');

	const loadFranchises = async () => {
		if (!tenantId) return;
		setLoading(true);
		try {
			const data = await listFranchises(tenantId);
			setFranchises(data);
		} catch (err) {
			console.error('Error loading franchises:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadFranchises();
	}, [tenantId]);

	const handleOpenCreate = () => {
		setFormName('');
		setFormSlug('');
		setFormLocationName('');
		setFormWhatsapp('');
		setFormTelegram('');
		setFormAddress('');
		setFormMapsUrl('');
		setFormInstagram('');
		setFormWorkingHours('Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h');
		setError(null);
		setModal({ type: 'create' });
	};

	const handleOpenEdit = (loc: FranchiseLocation) => {
		setFormName(loc.name);
		setFormSlug(loc.slug);
		setFormLocationName(loc.location_name);
		setFormWhatsapp(loc.whatsapp_number);
		setFormTelegram(loc.telegram_username || '');
		setFormAddress(loc.address);
		setFormMapsUrl(loc.maps_url);
		setFormInstagram(loc.instagram_handle || '');
		setFormWorkingHours(loc.working_hours);
		setError(null);
		setModal({ type: 'edit', location: loc });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!tenantId) return;
		setSubmitting(true);
		setError(null);

		const slugPattern = /^[a-z0-9-]+$/;
		if (!slugPattern.test(formSlug)) {
			setError('O slug deve conter apenas letras minúsculas, números e hífens (ex: brasilia-shopping).');
			setSubmitting(false);
			return;
		}

		try {
			const payload: Partial<FranchiseLocation> = {
				tenant_id: tenantId,
				name: formName,
				slug: formSlug,
				location_name: formLocationName,
				whatsapp_number: formWhatsapp,
				telegram_username: formTelegram || undefined,
				address: formAddress,
				maps_url: formMapsUrl,
				instagram_handle: formInstagram || undefined,
				working_hours: formWorkingHours,
			};

			if (modal?.type === 'edit' && modal.location) {
				payload.id = modal.location.id;
			}

			await upsertFranchise(payload);
			await loadFranchises();
			setModal(null);
		} catch (err: any) {
			setError(err.message || 'Erro ao salvar franquia');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('Tem certeza que deseja remover esta franquia? Isto desabilitará a página de catálogo correspondente.')) return;
		try {
			await deleteFranchise(id);
			await loadFranchises();
		} catch (err) {
			alert('Erro ao remover franquia');
		}
	};

	const copyCatalogLink = (slug: string, id: string) => {
		const link = `${window.location.origin}/c/${slug}`;
		void navigator.clipboard.writeText(link);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	if (!tenantId) return null;

	return (
		<div className="space-y-8 max-w-7xl mx-auto p-4">
			<Section className="flex flex-wrap items-center justify-between gap-4 mt-4">
				<div>
					<Title>Configuração de Franquias</Title>
					<p className="mt-1 text-sm text-muted-foreground">
						Gerencie as localizações físicas de suas franquias, integrando-as a links de catálogos públicos.
					</p>
				</div>
				<button
					onClick={handleOpenCreate}
					className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95 animate-fade-in"
				>
					<FiPlus className="text-sm" />
					Nova Franquia
				</button>
			</Section>

			<Section>
				<Card className="overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
								<tr>
									<th className="px-6 py-4">Nome & Link</th>
									<th className="px-6 py-4">Nome no CIGAM (Estoque)</th>
									<th className="px-6 py-4">Contato (WhatsApp)</th>
									<th className="px-6 py-4">Endereço</th>
									<th className="px-6 py-4 text-right">Ações</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/20">
								{loading ? (
									<tr>
										<td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
											Carregando franquias...
										</td>
									</tr>
								) : franchises.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
											Nenhuma franquia cadastrada.
										</td>
									</tr>
								) : (
									franchises.map((loc) => (
										<tr key={loc.id} className="group hover:bg-muted/30 transition-colors">
											<td className="px-6 py-4">
												<div className="font-semibold text-foreground">{loc.name}</div>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-[10px] text-muted-foreground select-all">
														/c/{loc.slug}
													</span>
													<button
														onClick={() => copyCatalogLink(loc.slug, loc.id)}
														className="text-muted-foreground hover:text-primary transition-colors"
														title="Copiar link do catálogo"
													>
														{copiedId === loc.id ? (
															<FiCheck className="text-emerald-500 text-xs" />
														) : (
															<FiCopy className="text-xs" />
														)}
													</button>
												</div>
											</td>
											<td className="px-6 py-4 text-muted-foreground font-mono text-xs">
												{loc.location_name}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-1.5 text-xs text-foreground">
													<FiPhone className="opacity-60 text-emerald-500" />
													<span>{loc.whatsapp_number}</span>
												</div>
												{loc.instagram_handle && (
													<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
														<FiInstagram className="opacity-60 text-pink-500" />
														<span>@{loc.instagram_handle}</span>
													</div>
												)}
											</td>
											<td className="px-6 py-4">
												<div className="text-xs text-foreground max-w-xs truncate" title={loc.address}>
													{loc.address}
												</div>
												<div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
													<FiClock className="opacity-60" />
													<span className="truncate max-w-[200px]">{loc.working_hours}</span>
												</div>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														onClick={() => handleOpenEdit(loc)}
														className="p-2 text-muted-foreground hover:text-primary transition-colors"
														title="Editar franquia"
													>
														<FiEdit2 />
													</button>
													<button
														onClick={() => handleDelete(loc.id)}
														className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
														title="Remover franquia"
													>
														<FiTrash2 />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</Card>
			</Section>

			<AnimatePresence>
				{modal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setModal(null)}
							className="absolute inset-0 bg-background/80 backdrop-blur-sm"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/50 bg-card p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold tracking-tight">
									{modal.type === 'create' ? 'Nova Franquia' : 'Editar Franquia'}
								</h2>
								<button onClick={() => setModal(null)} className="rounded-full p-2 hover:bg-muted transition-colors">
									<FiX className="text-xl" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								{error && (
									<div className="rounded-xl bg-red-500/10 p-4 text-xs font-medium text-red-500 border border-red-500/20">
										{error}
									</div>
								)}

								<div className="space-y-3">
									<div>
										<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
											Nome Comercial da Franquia
										</label>
										<input
											type="text"
											value={formName}
											onChange={e => {
												setFormName(e.target.value);
												// Auto slugify on create
												if (modal.type === 'create') {
													setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
												}
											}}
											required
											className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary"
											placeholder="ex: Stanley Park Shopping"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
												Slug da URL (Único)
											</label>
											<input
												type="text"
												value={formSlug}
												onChange={e => setFormSlug(e.target.value.toLowerCase())}
												required
												className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary font-mono"
												placeholder="ex: park-shopping"
											/>
										</div>
										<div>
											<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
												Nome no CIGAM (Estoque)
											</label>
											<input
												type="text"
												value={formLocationName}
												onChange={e => setFormLocationName(e.target.value)}
												required
												className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary font-mono"
												placeholder="ex: Park Shopping"
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
												WhatsApp (com DDI/DDD)
											</label>
											<input
												type="text"
												value={formWhatsapp}
												onChange={e => setFormWhatsapp(e.target.value.replace(/\D/g, ''))}
												required
												className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary"
												placeholder="ex: 5561999999999"
											/>
										</div>
										<div>
											<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
												Telegram (Usuário opcional)
											</label>
											<input
												type="text"
												value={formTelegram}
												onChange={e => setFormTelegram(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))}
												className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary"
												placeholder="ex: stanley_df"
											/>
										</div>
									</div>

									<div>
										<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
											Instagram (@ opcional)
										</label>
										<input
											type="text"
											value={formInstagram}
											onChange={e => setFormInstagram(e.target.value.replace(/[^A-Za-z0-9_.-]/g, ''))}
											className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary"
											placeholder="ex: stanley.df"
										/>
									</div>

									<div>
										<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
											Endereço Físico Completo
										</label>
										<textarea
											value={formAddress}
											onChange={e => setFormAddress(e.target.value)}
											required
											rows={2}
											className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary resize-none"
											placeholder="ex: Park Shopping, SAI/SO Área Octogonal - Guará, Brasília - DF, 71219-900"
										/>
									</div>

									<div>
										<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
											Link do Google Maps
										</label>
										<input
											type="url"
											value={formMapsUrl}
											onChange={e => setFormMapsUrl(e.target.value)}
											required
											className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary"
											placeholder="ex: https://maps.app.goo.gl/..."
										/>
									</div>

									<div>
										<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
											Horário de Funcionamento
										</label>
										<input
											type="text"
											value={formWorkingHours}
											onChange={e => setFormWorkingHours(e.target.value)}
											required
											className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-xs outline-none focus:border-primary"
											placeholder="ex: Segunda a Sábado: 10h às 22h | Domingo: 14h às 20h"
										/>
									</div>
								</div>

								<div className="pt-4 flex gap-3">
									<button
										type="button"
										onClick={() => setModal(null)}
										className="flex-1 rounded-2xl border border-border/50 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors"
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="flex-2 rounded-2xl bg-primary px-10 py-3 text-[11px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
									>
										{submitting ? 'Salvando...' : modal.type === 'create' ? 'Criar Franquia' : 'Salvar Alterações'}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default FranchiseSettingsPage;
