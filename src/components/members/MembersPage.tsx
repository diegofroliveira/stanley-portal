
import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { listTenantMembers, manageUser } from '../../services/adminService';
import { fetchProducts as listTenantProducts } from '../../services/dashboardService';
import { UserMembership, UserPermissions } from '../../types';
import { Card, Section, Title } from '../ui/Primitives';
import { FiUserPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSettings, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PERMISSIONS: UserPermissions = {
    menus: ['overview', 'estoque', 'clientes', 'vendedores'],
    actions: ['import', 'status_update'],
    locations: []
};

const MembersPage = ({ canInvite }: { canInvite: boolean }) => {
    const { tenant } = useTenant();
    const tenantId = tenant?.id;

    const [members, setMembers] = useState<UserMembership[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ type: 'create' | 'edit'; member?: UserMembership } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    // Form states
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<'admin' | 'manager' | 'operator'>('operator');
    const [formMenus, setFormMenus] = useState<string[]>(DEFAULT_PERMISSIONS.menus);
    const [formLocations, setFormLocations] = useState<string[]>([]);

    const loadMembers = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const data = await listTenantMembers(tenantId);
            setMembers(data);
            
            // Extract unique locations from products to show as options
            const prodData = await listTenantProducts(tenantId);
            const locs = Array.from(new Set(prodData.map(p => p.location))).filter(Boolean);
            setAvailableLocations(locs);
        } catch (err) {
            console.error('Error loading members:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMembers();
    }, [tenantId]);

    const handleOpenCreate = () => {
        setFormEmail('');
        setFormPassword('');
        setFormRole('operator');
        setFormMenus(DEFAULT_PERMISSIONS.menus);
        setFormLocations([]);
        setError(null);
        setModal({ type: 'create' });
    };

    const handleOpenEdit = (member: UserMembership) => {
        setFormEmail(member.email || '');
        setFormRole(member.role);
        setFormMenus(member.permissions?.menus || DEFAULT_PERMISSIONS.menus);
        setFormLocations(member.permissions?.locations || []);
        setError(null);
        setModal({ type: 'edit', member });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;
        setSubmitting(true);
        setError(null);

        try {
            if (modal?.type === 'create') {
                await manageUser({
                    action: 'create',
                    tenant_id: tenantId,
                    email: formEmail,
                    password: formPassword,
                    role: formRole,
                    permissions: { menus: formMenus, actions: DEFAULT_PERMISSIONS.actions, locations: formLocations }
                });
            } else if (modal?.type === 'edit' && modal.member) {
                await manageUser({
                    action: 'update',
                    tenant_id: tenantId,
                    user_id: modal.member.user_id,
                    role: formRole,
                    permissions: { 
                        menus: formMenus, 
                        actions: modal.member.permissions?.actions || DEFAULT_PERMISSIONS.actions,
                        locations: formLocations 
                    }
                });
            }
            await loadMembers();
            setModal(null);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!tenantId || !window.confirm('Tem certeza que deseja remover este acesso?')) return;
        try {
            await manageUser({
                action: 'remove',
                tenant_id: tenantId,
                user_id: userId
            });
            await loadMembers();
        } catch (err) {
            alert('Erro ao remover usuário');
        }
    };

    const toggleMenu = (menu: string) => {
        setFormMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
    };

    if (!tenantId) return null;

    return (
        <div className="space-y-8 p-6 lg:p-10">
            <Section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Title>Gestão de Equipe</Title>
                    <p className="mt-1 text-sm text-muted-foreground">Gerencie quem tem acesso ao portal e o que cada um pode ver.</p>
                </div>
                {canInvite && (
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
                    >
                        <FiUserPlus className="text-lg" />
                        Novo Usuário
                    </button>
                )}
            </Section>

            <Section>
                <Card className="overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Nível de Acesso</th>
                                    <th className="px-6 py-4">Menus Habilitados</th>
                                    <th className="px-6 py-4">Data de Cadastro</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                            Carregando membros...
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                            Nenhum usuário cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => (
                                        <tr key={member.user_id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-foreground">{member.email}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{member.user_id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                    member.role === 'admin' ? 'bg-amber-500/10 text-amber-500' :
                                                    member.role === 'manager' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(member.permissions?.menus || []).map(m => (
                                                        <span key={m} className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase font-medium text-muted-foreground">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs">
                                                {member.created_at ? new Date(member.created_at).toLocaleDateString('pt-BR') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleOpenEdit(member)}
                                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                        title="Editar permissões"
                                                    >
                                                        <FiSettings />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(member.user_id)}
                                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                                        title="Remover acesso"
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
                            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/50 bg-card p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold tracking-tight">
                                    {modal.type === 'create' ? 'Novo Usuário' : 'Configurar Acesso'}
                                </h2>
                                <button onClick={() => setModal(null)} className="rounded-full p-2 hover:bg-muted transition-colors">
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="rounded-xl bg-red-500/10 p-4 text-xs font-medium text-red-500 border border-red-500/20">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">E-mail</label>
                                        <input 
                                            type="email"
                                            value={formEmail}
                                            onChange={e => setFormEmail(e.target.value)}
                                            required
                                            disabled={modal.type === 'edit'}
                                            className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                                            placeholder="ex: joao@empresa.com.br"
                                        />
                                    </div>

                                    {modal.type === 'create' && (
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha Provisória</label>
                                            <div className="relative">
                                                <input 
                                                    type="password"
                                                    value={formPassword}
                                                    onChange={e => setFormPassword(e.target.value)}
                                                    required
                                                    className="mt-1 w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary pl-10"
                                                    placeholder="••••••••"
                                                />
                                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nível de Permissão</label>
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {(['admin', 'manager', 'operator'] as const).map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setFormRole(role)}
                                                    className={`rounded-xl border py-2 text-[10px] font-bold uppercase tracking-widest transition ${
                                                        formRole === role ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-muted/30 text-muted-foreground'
                                                    }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Menus Visíveis (Frontend)</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {[
                                                { id: 'overview', label: 'Dashboard' },
                                                { id: 'estoque', label: 'Estoque' },
                                                { id: 'clientes', label: 'Clientes' },
                                                { id: 'vendedores', label: 'Vendedores' }
                                            ].map(menu => (
                                                <button
                                                    key={menu.id}
                                                    type="button"
                                                    onClick={() => toggleMenu(menu.id)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                                                        formMenus.includes(menu.id) ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500' : 'border-border/50 bg-muted/30 text-muted-foreground'
                                                    }`}
                                                >
                                                    {formMenus.includes(menu.id) ? <FiCheck /> : <FiX className="opacity-20" />}
                                                    {menu.label}
                                                </button>
                                            ))}
                                        </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Restringir por Local (RLS)</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {availableLocations.length === 0 ? (
                                                <p className="text-[10px] text-muted-foreground italic px-1">Nenhum local específico encontrado.</p>
                                            ) : (
                                                availableLocations.map(loc => (
                                                    <button
                                                        key={loc}
                                                        type="button"
                                                        onClick={() => setFormLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])}
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                                                            formLocations.includes(loc) ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-border/50 bg-muted/30 text-muted-foreground'
                                                        }`}
                                                    >
                                                        {formLocations.includes(loc) ? <FiCheck /> : <FiX className="opacity-20" />}
                                                        {loc}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <p className="mt-1 text-[9px] text-muted-foreground ml-1">Deixe vazio para permitir acesso a todos os locais.</p>
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
                                        {submitting ? 'Salvando...' : modal.type === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
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

export default MembersPage;
