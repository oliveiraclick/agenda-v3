
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Establishment } from '../../types';

const SalonsTable: React.FC = () => {
    const [salons, setSalons] = useState<Establishment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('establishments')
            .select('*, services(count)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching salons:', error);
        else setSalons(data || []);
        setLoading(false);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        const { error } = await supabase
            .from('establishments')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar status');
        } else {
            setSalons(salons.map(s => s.id === id ? { ...s, status: newStatus as 'active' | 'blocked' | 'pending' } : s));
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o cliente "${name}"? Essa ação não pode ser desfeita e apagará todos os dados vinculados.`)) return;

        // Optimistic Update: Remove immediately from UI
        const previousSalons = [...salons];
        setSalons(salons.filter(s => s.id !== id));
        setLoading(true);

        const { error } = await supabase.from('establishments').delete().eq('id', id);

        if (error) {
            // Revert if failed
            setSalons(previousSalons);
            alert('Erro ao excluir cliente: ' + error.message + '\n\nDICA: Verifique se rodou o script de CASCADE no banco de dados.');
        } else {
            alert('Cliente excluído com sucesso.');
            // No need to fetch again if successful, we already removed it.
        }
        setLoading(false);
    };

    const grantFreeDays = async (id: string, currentPlan: string) => {
        const { error } = await supabase
            .from('establishments')
            .update({
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_plan: 'pro'
            })
            .eq('id', id);

        if (error) {
            alert('Erro ao dar dias grátis');
        } else {
            alert('30 dias grátis concedidos com sucesso!');
            fetchSalons();
        }
    };

    const sendPaymentReminder = async (salonName: string, ownerId: string) => {
        if (!ownerId) {
            alert('Este cliente não tem um dono vinculado corretamente.');
            return;
        }

        const confirmSend = window.confirm(`Deseja enviar um lembrete amigável de pagamento para ${salonName}?`);
        if (!confirmSend) return;

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: ownerId,
                title: 'Lembrete de Assinatura',
                message: `Olá! Passando apenas para lembrar que sua assinatura do Agende Mais vence em breve. Para continuar aproveitando todos os recursos, verifique seu pagamento. Qualquer dúvida, estamos à disposição! 🚀`,
                type: 'info'
            });

        if (error) {
            console.error(error);
            alert('Erro ao enviar notificação.');
        } else {
            alert('Lembrete enviado com sucesso!');
        }
    };

    const filteredSalons = salons.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Gerenciar Clientes</h2>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-brand focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Plano</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Trial / Vencimento</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Carregando...</td></tr>
                        ) : filteredSalons.map(salon => (
                            <tr key={salon.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url("${salon.logo_url || 'https://picsum.photos/seed/salon/100'}")` }}></div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{salon.name}</p>
                                            <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{salon.address || 'Sem endereço'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${salon.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-600' :
                                        salon.subscription_plan === 'enterprise' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {salon.subscription_plan || 'free'}
                                    </span>
                                    {/* @ts-ignore */}
                                    {salon.services?.[0]?.count === 0 && (
                                        <div className="flex items-center gap-1 mt-1 text-amber-500">
                                            <span className="material-symbols-outlined text-[14px]">warning</span>
                                            <span className="text-[9px] font-bold">Sem Serviços</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${salon.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {salon.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-500">
                                        {salon.trial_ends_at ? new Date(salon.trial_ends_at).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => sendPaymentReminder(salon.name, salon.owner_id || '')}
                                            title="Enviar Lembrete de Pagamento"
                                            className="size-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center hover:bg-amber-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                                        </button>
                                        <button
                                            onClick={() => grantFreeDays(salon.id, salon.subscription_plan)}
                                            title="Dar 30 dias grátis"
                                            className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(salon.id, salon.status)}
                                            title={salon.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${salon.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {salon.status === 'blocked' ? 'lock_open' : 'lock'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(salon.id, salon.name)}
                                            title="Excluir Cliente"
                                            className="size-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalonsTable;
