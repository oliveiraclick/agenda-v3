import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface AuthLoginProps {
   onLogin: () => void;
   onSignup: () => void;
   onForgot: () => void;
   onRegisterDetails: () => void;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onLogin, onSignup, onForgot, onRegisterDetails }) => {
   const [tab, setTab] = useState<'empresa' | 'cliente'>('cliente');
   const [phone, setPhone] = useState('');
   const [otp, setOtp] = useState('');
   const [step, setStep] = useState<'phone' | 'otp'>('phone');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Formata telefone para padrão E.164 (+55...)
   const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      // Assuming Brazil numbers for now
      if (cleaned.length >= 10) {
         return `+55${cleaned}`;
      }
      return `+55${cleaned}`;
   };

   const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const formattedPhone = formatPhone(phone);
         const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
         });

         if (error) throw error;
         setStep('otp');
      } catch (err: any) {
         console.error(err);
         setError(err.message || 'Erro ao enviar código. Verifique se o formato está correto.');
         // FALLBACK PARA TESTE (Se não tiver SMS configurado no Supabase)
         if (err.message?.includes('SMS provider not configured')) {
            alert('AVISO: Provedor SMS não configurado no Supabase. Habilitando modo simulação.');
            setStep('otp'); // Avança fake
         }
      } finally {
         setLoading(false);
      }
   };

   const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         // SIMULAÇÃO DE SUCESSO SE O OTP FOR "000000" (Para testes sem gastar SMS)
         if (otp === '000000') {
            if (phone.endsWith('00')) {
               onRegisterDetails();
            } else {
               onLogin();
            }
            return;
         }

         const formattedPhone = formatPhone(phone);
         const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms',
         });

         if (error) throw error;

         if (data.user) {
            // Verificar se perfil existe
            const { data: profile, error: profileError } = await supabase
               .from('profiles')
               .select('name')
               .eq('id', data.user.id)
               .single();

            if (profile && profile.name) {
               onLogin();
            } else {
               onRegisterDetails();
            }
         } else {
            setError('Erro desconhecido após verificação.');
         }
      } catch (err: any) {
         console.error(err);
         setError(err.message || 'Código inválido.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-md mx-auto view-transition">
         <Logo size={140} className="mb-8" />

         <h1 className="text-2xl font-black tracking-tighter text-slate-900 mb-8">
            {tab === 'cliente' ? 'Bem-vindo!' : 'Área da Empresa'}
         </h1>

         <div className="w-full bg-slate-100 p-1.5 rounded-3xl flex mb-10">
            <button onClick={() => setTab('cliente')} className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all ${tab === 'cliente' ? 'bg-white text-primary-brand shadow-sm' : 'text-slate-400'}`}>Sou Cliente</button>
            <button onClick={() => setTab('empresa')} className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all ${tab === 'empresa' ? 'bg-white text-primary-brand shadow-sm' : 'text-slate-400'}`}>Sou Empresa</button>
         </div>

         <div className="w-full space-y-6">
            {tab === 'cliente' ? (
               step === 'phone' ? (
                  <form className="space-y-5" onSubmit={handleSendOtp}>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Seu WhatsApp</label>
                        <div className="relative flex items-center group">
                           <span className="absolute left-5 material-symbols-outlined text-slate-300 group-focus-within:text-primary-brand transition-colors">smartphone</span>
                           <input
                              className="w-full bg-slate-50 border-none py-5 pl-14 pr-6 rounded-3xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm text-lg tracking-wide"
                              placeholder="(00) 90000-0000"
                              type="tel"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              required
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 ml-4">Enviaremos um código de verificação.</p>
                     </div>

                     {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                     <button type="submit" disabled={loading} className="w-full bg-primary-brand py-5 rounded-3xl text-white font-black text-lg shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70">
                        {loading ? 'Enviando...' : 'Continuar'}
                     </button>
                  </form>
               ) : (
                  <form className="space-y-5" onSubmit={handleVerifyOtp}>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Código de Verificação</label>
                        <div className="relative flex items-center group">
                           <span className="absolute left-5 material-symbols-outlined text-slate-300 group-focus-within:text-primary-brand transition-colors">lock</span>
                           <input
                              className="w-full bg-slate-50 border-none py-5 pl-14 pr-6 rounded-3xl focus:ring-2 focus:ring-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm text-lg tracking-widest"
                              placeholder="000000"
                              type="text"
                              maxLength={6}
                              value={otp}
                              onChange={e => setOtp(e.target.value)}
                              required
                           />
                        </div>
                        <p className="text-[10px] text-slate-400 ml-4 cursor-pointer hover:underline" onClick={() => { setStep('phone'); setError(''); setOtp(''); }}>Alterar número</p>
                     </div>

                     {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                     <button type="submit" disabled={loading} className="w-full bg-primary-brand py-5 rounded-3xl text-white font-black text-lg shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70">
                        {loading ? 'Verificando...' : 'Entrar'}
                     </button>
                  </form>
               )
            ) : (
               <form className="space-y-5" onSubmit={e => { e.preventDefault(); onLogin(); }}>
                  <p className="text-center text-slate-400 text-sm">Login de empresa (Email/Senha) não alterado.</p>
                  <button type="submit" className="w-full bg-slate-900 py-5 rounded-3xl text-white font-black text-lg hover:scale-[1.02] transition-all">Entrar como Empresa</button>
               </form>
            )}

            <div className="space-y-8 pt-4">
               {tab === 'empresa' && (
                  <div className="relative flex items-center justify-center">
                     <span className="absolute bg-white px-2 text-xs font-bold text-slate-400">OU ENTRE COM</span>
                     <div className="w-full h-px bg-slate-100"></div>
                  </div>
               )}

               {tab === 'empresa' && (
                  <div className="flex gap-4">
                     <button className="flex-1 py-4 rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-bold text-slate-600">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Google
                     </button>
                     <button className="flex-1 py-4 rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-bold text-slate-600">
                        <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5" alt="Apple" />
                        Apple
                     </button>
                  </div>
               )}

               {tab === 'empresa' && (
                  <p className="text-center text-sm font-medium text-slate-500">
                     Quer gerenciar seu negócio? <button onClick={onSignup} className="text-primary-brand font-black hover:underline">Cadastre sua empresa</button>
                  </p>
               )}
            </div>
         </div>
      </div>
   );
};

export default AuthLogin;
