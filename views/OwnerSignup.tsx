import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface OwnerSignupProps {
    onComplete: () => void;
    onBack: () => void;
}

const OwnerSignup: React.FC<OwnerSignupProps> = ({ onComplete, onBack }) => {
    const [companyName, setCompanyName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Criar conta no Supabase Auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: ownerName,
                        role: 'owner',
                        company_name: companyName,
                        phone: phone
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!signUpData.user) throw new Error('Erro ao criar usuário.');

            // 2. Fazer login
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) throw signInError;

            // 3. Criar perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: signUpData.user.id,
                        name: ownerName,
                        role: 'owner',
                    }
                ]);

            if (profileError) throw profileError;

            console.log('✅ Empresa cadastrada com sucesso!');
            onComplete();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao cadastrar empresa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-md mx-auto view-transition relative overflow-y-auto pb-20">
            <button onClick={onBack} className="absolute top-6 left-6 size-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            </button>

            <Logo size={100} className="mb-6 mt-6" />

            <div className="w-full space-y-2 mb-8">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900">Cadastro de Empresa</h1>
                <p className="text-slate-500 font-medium">Preencha os dados para criar sua conta empresarial.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {/* Nome da Empresa */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                    <input
                        className="w-full bg-slate-50 border-none py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="Ex: Salão Beleza Total"
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        required
                    />
                </div>

                {/* Nome do Responsável */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
                    <input
                        className="w-full bg-slate-50 border-none py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="Nome completo"
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        required
                    />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone/WhatsApp</label>
                    <input
                        className="w-full bg-slate-50 border-none py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="(00) 90000-0000"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <input
                        className="w-full bg-slate-50 border-none py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="seu@email.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                    <input
                        className="w-full bg-slate-50 border-none py-4 px-5 rounded-2xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300"
                        placeholder="Mínimo 6 caracteres"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-brand py-5 rounded-3xl text-white font-black text-lg shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 mt-6"
                >
                    {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
                </button>
            </form>
        </div>
    );
};

export default OwnerSignup;
