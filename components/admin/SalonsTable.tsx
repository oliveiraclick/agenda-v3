
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
            .select('*')
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
            setSalons(salons.map(s => s.id === id ? { ...s, status: newStatus } : s));
        }
    };

    const grantFreeDays = async (id: string, days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        const trialEndsAt = date.toISOString();

        const { error } = await supabase
            .from('establishments')
            .update({ trial_ends_at: trialEndsAt, subscription_plan: 'pro' })
            .eq('id', id);

        if (error) {
            alert('Erro ao dar dias grátis');
        } else {
            alert(`Salão ganhou ${days} dias grátis!`);
            fetchSalons();
        }
    };

    const filteredSalons = salons.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Salões Cadastrados</h2>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Buscar salão..."
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
                            <th className="px-6 py-4">Salão</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Plano</th>
                            <th className="px-6 py-4">Trial Até</th>
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
                                        <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url("${salon.logo_url || 'https://picsum.photos/seed/salon/100'}")` }}></div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{salon.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">/{salon.slug || 'sem-slug'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${salon.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                            salon.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {salon.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-600 uppercase">{salon.subscription_plan || 'free'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-500">
                                        {salon.trial_ends_at ? new Date(salon.trial_ends_at).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => grantFreeDays(salon.id, 30)}
                                            title="Dar 30 dias grátis"
                                            className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(salon.id, salon.status || 'active')}
                                            title={salon.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${salon.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {salon.status === 'blocked' ? 'lock_open' : 'lock'}
                                            </span>
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
