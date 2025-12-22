import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

interface AuthLoginProps {
   onLogin: () => void;
   onForgotPassword: () => void;
   onSignup: () => void;
   onRegisterDetails?: () => void;
   onBack?: () => void;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onLogin, onForgotPassword, onSignup }) => {
   const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
   const [phone, setPhone] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         let authEmail = email;
         let authPassword = password;

         // Lógica para Login por Telefone (Shadow Credentials)
         if (loginMethod === 'phone') {
            const cleanedPhone = phone.replace(/\D/g, '');
            if (cleanedPhone.length < 10) {
               throw new Error('Telefone inválido. Digite DDD + Número.');
            }
            authEmail = `${cleanedPhone}@cliente.agenda.app`;
            authPassword = `pass_${cleanedPhone}`;
         }

         // 1. Tenta autenticar
         const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
         });

         if (authError) throw authError;

         if (authData.user) {
            // 2. Busca o perfil
            const { data: profile, error: profileError } = await supabase
               .from('profiles')
               .select('role')
               .eq('id', authData.user.id)
               .maybeSingle();

            if (profileError) {
               console.error("Erro ao buscar perfil:", profileError);
               onLogin();
               return;
            }
            onLogin();
         }
      } catch (err: any) {
         console.error("Erro completo:", err);
         let msg = err.message;

         if (msg === 'Invalid login credentials') {
            msg = loginMethod === 'phone'
               ? 'Telefone não encontrado ou senha incorreta. Se acabou de criar, tente novamente.'
               : 'E-mail ou senha incorretos.';
         }

         setError(msg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="h-screen w-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[#F8FAFC]">
         {/* Background Gradients & Blobs */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-brand/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
         </div>

         <div className="w-full max-w-md mx-auto relative z-10">
            {/* Main Card */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

               {/* Header */}
               <div className="text-center mb-10">
                  <div className="inline-flex p-4 bg-white rounded-3xl shadow-lg shadow-primary-brand/10 mb-6 animate-in zoom-in duration-700 delay-100">
                     <Logo size={60} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Bem-vindo</h1>
                  <p className="text-slate-500 font-medium">Entre para gerenciar seus agendamentos.</p>
               </div>

               {/* Custom Tab Switcher */}
               <div className="relative p-1.5 bg-slate-100/80 rounded-2xl mb-8 flex">
                  <div
                     className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${loginMethod === 'phone' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
                  />
                  <button
                     onClick={() => setLoginMethod('phone')}
                     className={`flex-1 py-3.5 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300 ${loginMethod === 'phone' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     Sou Cliente
                  </button>
                  <button
                     onClick={() => setLoginMethod('email')}
                     className={`flex-1 py-3.5 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300 ${loginMethod === 'email' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     Sou Empresa
                  </button>
               </div>

               <form onSubmit={handleLogin} className="space-y-6">
                  {loginMethod === 'phone' ? (
                     <div className="space-y-2 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="relative group">
                           <div className="absolute inset-0 bg-gradient-to-r from-primary-brand to-rose-400 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500 blur-md" />
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">smartphone</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Seu Celular</label>
                                    <input
                                       type="tel"
                                       placeholder="(00) 00000-0000"
                                       className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                       value={phone}
                                       onChange={(e) => {
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
                  ) : (
                     <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-500">
                        <div className="relative group">
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">mail</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">E-mail Profissional</label>
                                    <input
                                       type="email"
                                       placeholder="exemplo@empresa.com"
                                       className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                       value={email}
                                       onChange={(e) => setEmail(e.target.value)}
                                       required
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="relative group">
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">lock</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Senha</label>
                                    <input
                                       type="password"
                                       placeholder="••••••••"
                                       className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                       value={password}
                                       onChange={(e) => setPassword(e.target.value)}
                                       required
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-end">
                           <button
                              type="button"
                              onClick={onForgotPassword}
                              className="text-xs font-bold text-slate-400 hover:text-primary-brand transition-colors"
                           >
                              Esqueceu a senha?
                           </button>
                        </div>
                     </div>
                  )}

                  {error && (
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="size-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                           <span className="material-symbols-outlined text-red-500 text-sm">priority_high</span>
                        </div>
                        <p className="text-red-500 text-xs font-bold">{error}</p>
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-gradient-to-r from-primary-brand to-rose-600 py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-primary-brand/30 hover:shadow-xl hover:shadow-primary-brand/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                     <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                           <>
                              <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Entrando...
                           </>
                        ) : (
                           <>
                              Entrar
                              <span className="material-symbols-outlined text-xl">arrow_forward</span>
                           </>
                        )}
                     </span>
                  </button>
               </form>
            </div>

            <p className="text-center mt-8 text-slate-400 font-medium text-sm animate-in fade-in duration-1000 delay-500">
               Não tem conta? <button onClick={onSignup} className="text-primary-brand font-black hover:underline">Cadastre-se</button>
            </p>
         </div>
      </div>
   );
};

export default AuthLogin;
