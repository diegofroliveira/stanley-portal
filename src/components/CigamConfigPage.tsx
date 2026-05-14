import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Section } from './ui/Primitives';
import { FiSave, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface CigamConfig {
	is_active: boolean;
	cigam_user_1: string;
	cigam_pass_1: string;
	cigam_key: string;
	cigam_user_2: string;
	cigam_pass_2: string;
	sync_status: string;
	last_synced_at: string | null;
	sync_error_message: string | null;
}

const CigamConfigPage = ({ tenantId }: { tenantId: string }) => {
	const [config, setConfig] = useState<CigamConfig>({
		is_active: false,
		cigam_user_1: '',
		cigam_pass_1: '',
		cigam_key: '',
		cigam_user_2: '',
		cigam_pass_2: '',
		sync_status: 'idle',
		last_synced_at: null,
		sync_error_message: null,
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	useEffect(() => {
		const fetchConfig = async () => {
			const { data, error } = await supabase
				.from('tenant_cigam_config')
				.select('*')
				.eq('tenant_id', tenantId)
				.maybeSingle();

			if (!error && data) {
				setConfig({
					is_active: data.is_active ?? false,
					cigam_user_1: data.cigam_user_1 ?? '',
					cigam_pass_1: data.cigam_pass_1 ?? '',
					cigam_key: data.cigam_key ?? '',
					cigam_user_2: data.cigam_user_2 ?? '',
					cigam_pass_2: data.cigam_pass_2 ?? '',
					sync_status: data.sync_status ?? 'idle',
					last_synced_at: data.last_synced_at,
					sync_error_message: data.sync_error_message,
				});
			}
			setLoading(false);
		};

		void fetchConfig();
	}, [tenantId]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setFeedback(null);

		const { error } = await supabase.from('tenant_cigam_config').upsert({
			tenant_id: tenantId,
			...config,
			updated_at: new Date().toISOString(),
		});

		if (error) {
			setFeedback({ type: 'error', message: 'Falha ao salvar configuração: ' + error.message });
		} else {
			setFeedback({ type: 'success', message: 'Configuração salva com sucesso!' });
		}
		setSaving(false);
	};

	if (loading) {
		return (
			<Section className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</Section>
		);
	}

	return (
		<Section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div>
				<p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
					Configurações de Integração
				</p>
				<h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">ERP CIGAM Gestor</h2>
			</div>

			<form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-2">
				<Card interactive={false} className="space-y-6 bg-muted/30 border-border/40">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Credenciais de Acesso</h3>
						<div className="flex items-center gap-2">
							<span className="text-[10px] uppercase font-bold text-muted-foreground">Status do Robô</span>
							<button
								type="button"
								onClick={() => setConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
								className={`h-6 w-11 rounded-full transition-colors relative ${config.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
							>
								<div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${config.is_active ? 'left-6' : 'left-1'}`} />
							</button>
						</div>
					</div>

					<div className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Usuário 1 (WTS)</label>
								<input
									type="text"
									value={config.cigam_user_1}
									onChange={e => setConfig(prev => ({ ...prev, cigam_user_1: e.target.value }))}
									placeholder="Ex: SY70#001"
									className="w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary/50"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Senha 1</label>
								<input
									type="password"
									value={config.cigam_pass_1}
									onChange={e => setConfig(prev => ({ ...prev, cigam_pass_1: e.target.value }))}
									className="w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary/50"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chave CIGAM</label>
							<input
								type="text"
								value={config.cigam_key}
								onChange={e => setConfig(prev => ({ ...prev, cigam_key: e.target.value }))}
								placeholder="Ex: RLEY"
								className="w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary/50"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 pt-2">
							<div className="space-y-2">
								<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Usuário 2 (Gestor)</label>
								<input
									type="text"
									value={config.cigam_user_2}
									onChange={e => setConfig(prev => ({ ...prev, cigam_user_2: e.target.value }))}
									placeholder="Ex: JONATASU"
									className="w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary/50"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Senha 2</label>
								<input
									type="password"
									value={config.cigam_pass_2}
									onChange={e => setConfig(prev => ({ ...prev, cigam_pass_2: e.target.value }))}
									className="w-full rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary/50"
								/>
							</div>
						</div>
					</div>

					<button
						type="submit"
						disabled={saving}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50"
					>
						{saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
						{saving ? 'Salvando...' : 'Salvar Configurações'}
					</button>

					{feedback && (
						<div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
							{feedback.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
							{feedback.message}
						</div>
					)}
				</Card>

				<div className="space-y-6">
					<Card interactive={false} className="bg-card/40 border-border/30 backdrop-blur-sm">
						<h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Status do Sync</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between py-2 border-b border-border/10">
								<span className="text-xs text-muted-foreground">Estado Atual</span>
								<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
									config.sync_status === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
									config.sync_status === 'error' ? 'bg-red-500/20 text-red-500' :
									config.sync_status === 'running' ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'
								}`}>
									{config.sync_status}
								</span>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-border/10">
								<span className="text-xs text-muted-foreground">Última Sincronização</span>
								<span className="text-xs font-medium text-foreground">
									{config.last_synced_at ? new Date(config.last_synced_at).toLocaleString('pt-BR') : 'Nunca'}
								</span>
							</div>
							{config.sync_error_message && (
								<div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
									<p className="text-[10px] uppercase font-bold text-red-500 mb-1">Último Erro</p>
									<p className="text-xs text-muted-foreground leading-relaxed">{config.sync_error_message}</p>
								</div>
							)}
						</div>
					</Card>

					<div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
						<h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">💡 Dica de Segurança</h4>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Estas credenciais são usadas pelo robô automatizado para acessar o portal CIGAM Gestor de sua franquia. 
							Mantenha-as atualizadas para garantir que o estoque no portal esteja sempre sincronizado.
						</p>
					</div>
				</div>
			</form>
		</Section>
	);
};

export default CigamConfigPage;
