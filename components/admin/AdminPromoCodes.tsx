
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PromoCode } from '../../types';

const AdminPromoCodes: React.FC = () => {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState('');
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching codes:', error);
        else setCodes(data || []);
        setLoading(false);
    };

    const createCode = async () => {
        if (!newCode) return;

        const formattedCode = newCode.trim().toUpperCase();
        // Ensure it starts with #
        const finalCode = formattedCode.startsWith('#') ? formattedCode : `#${formattedCode}`;

        const { error } = await supabase
            .from('promo_codes')
            .insert({
                code: finalCode,
                days_granted: days,
                active: true
            });

        if (error) {
            alert('Erro ao criar código. Verifique se já existe.');
        } else {
            setNewCode('');
            fetchCodes();
        }
    };

    const deleteCode = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este código?')) return;

        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir código');
        } else {
            fetchCodes();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-4">Códigos Promocionais</h2>

                <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Código</label>
                        <input
                            type="text"
                            placeholder="#60DIASLIVRE"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-primary-brand outline-none"
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Dias Grátis</label>
                        <select
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                            value={days}
                            onChange={e => setDays(Number(e.target.value))}
                        >
                            <option value={30}>30 Dias</option>
                            <option value={60}>60 Dias</option>
                            <option value={90}>90 Dias</option>
                            <option value={7}>7 Dias (Teste)</option>
                        </select>
                    </div>
                    <button
                        onClick={createCode}
                        className="px-6 py-2 bg-primary-brand text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                    >
                        Criar Código
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Código</th>
                            <th className="px-6 py-4">Dias</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Carregando...</td></tr>
                        ) : codes.map(code => (
                            <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{code.code}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-emerald-600">+{code.days_granted} dias</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${code.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {code.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => deleteCode(code.id)}
                                        className="size-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-auto"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {codes.length === 0 && !loading && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum código criado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPromoCodes;
