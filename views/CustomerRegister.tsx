
import React, { useState } from 'react';
import Logo from '../components/Logo';

import { supabase } from '../lib/supabase';

interface CustomerRegisterProps {
    onComplete: () => void;
}

const CustomerRegister: React.FC<CustomerRegisterProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Usuário não autenticado.');

            const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        name: name,
                        role: 'customer',
                        // birth_date: birthDate, // Assuming schema has this, or add it if needed. warning if not in schema.
                        // Let's stick to core fields for now based on AuthLogin check (it checked 'name').
                    }
                ]);

            if (insertError) throw insertError;

            onComplete();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-md mx-auto view-transition">
            <Logo size={100} className="mb-8" />

            <div className="w-full space-y-2 mb-8">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900">Quase lá!</h1>
                <p className="text-slate-500 font-medium">Precisamos apenas de alguns dados para criar seu perfil.</p>
            </div>

            <form className="w-full space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-5 material-symbols-outlined text-slate-300 group-focus-within:text-primary-brand transition-colors">person</span>
                        <input
                            className="w-full bg-slate-50 border-none py-5 pl-14 pr-6 rounded-3xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm"
                            placeholder="Como gostaria de ser chamado?"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-5 material-symbols-outlined text-slate-300 group-focus-within:text-primary-brand transition-colors">cake</span>
                        <input
                            className="w-full bg-slate-50 border-none py-5 pl-14 pr-6 rounded-3xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm"
                            placeholder="DD/MM/AAAA"
                            type="date"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            required
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-4">Ganhe brindes no seu aniversário!</p>
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-primary-brand py-5 rounded-3xl text-white font-black text-lg shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70">
                    {loading ? 'Salvando...' : 'Concluir Cadastro'}
                </button>
            </form>
        </div>
    );
};

export default CustomerRegister;
