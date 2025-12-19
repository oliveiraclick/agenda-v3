import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface CustomerRegisterProps {
    onComplete: () => void;
    onBack: () => void;
}

const CustomerRegister: React.FC<CustomerRegisterProps> = ({ onComplete, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Limpeza e Formatação
            const cleanedPhone = phone.replace(/\D/g, '');
            if (cleanedPhone.length < 10) throw new Error('Telefone inválido.');

            const shadowEmail = `${cleanedPhone}@cliente.agenda.app`;
            const shadowPassword = `pass_${cleanedPhone}`;

            // 2. Cadastro no Auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: shadowEmail,
                password: shadowPassword,
                options: {
                    data: { name, role: 'customer' }
                }
            });

            let currentUserId = signUpData.user?.id;

            // 3. Tratamento de usuário já existente
            if (signUpError) {
                if (signUpError.message.includes('already registered') || signUpError.message.includes('unique constraint')) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: shadowEmail,
                        password: shadowPassword,
                    });
                    if (signInError) throw new Error('Este telefone já está cadastrado.');
                    currentUserId = signInData.user?.id;
                } else {
                    throw signUpError;
                }
            }

            // 4. Inserção no Perfil (Upsert é mais seguro que Insert)
            if (currentUserId) {
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: currentUserId,
                        name: name,
                        phone: cleanedPhone,
                        birth_date: birthDate, // Agora salvando a data coletada
                        role: 'customer',
                        updated_at: new Date()
                    });

                if (upsertError) throw upsertError;
            }

            onComplete();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao processar cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Gradients & Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-brand/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </div>

            <button onClick={onBack} className="absolute top-6 left-6 size-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-20 group border border-white/50">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-brand transition-colors">arrow_back</span>
            </button>

            <div className="w-full max-w-md mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-white rounded-3xl shadow-lg shadow-primary-brand/10 mb-6 animate-in zoom-in duration-700">
                            <Logo size={50} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Quase lá!</h1>
                        <p className="text-slate-500 font-medium text-sm">Preencha seus dados para finalizar.</p>
                    </div>

                    <form className="w-full space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                                    <div className="flex items-center px-4">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">person</span>
                                        <div className="flex-1 py-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nome Completo</label>
                                            <input
                                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                                placeholder="Seu nome"
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                                    <div className="flex items-center px-4">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">smartphone</span>
                                        <div className="flex-1 py-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Seu WhatsApp</label>
                                            <input
                                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                                placeholder="(00) 00000-0000"
                                                type="tel"
                                                value={phone}
                                                onChange={e => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 11) v = v.substring(0, 11);
                                                    setPhone(v);
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                                    <div className="flex items-center px-4">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">cake</span>
                                        <div className="flex-1 py-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nascimento</label>
                                            <input
                                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                                placeholder="DD/MM/AAAA"
                                                type="date"
                                                value={birthDate}
                                                onChange={e => setBirthDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 ml-4 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] text-primary-brand">redeem</span>
                                Ganhe brindes no seu aniversário!
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <div className="size-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500 text-sm">priority_high</span>
                                </div>
                                <p className="text-red-500 text-xs font-bold">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary-brand to-rose-600 py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-primary-brand/30 hover:shadow-xl hover:shadow-primary-brand/40 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Salvando...
                                    </span>
                                ) : 'Concluir Cadastro'}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegister;
