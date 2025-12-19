import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import AuthFeedback from './AuthFeedback';

interface AuthForgotPasswordProps {
   onBack: () => void;
}

const AuthForgotPassword: React.FC<AuthForgotPasswordProps> = ({ onBack }) => {
   const [identifier, setIdentifier] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [successEmail, setSuccessEmail] = useState('');

   const handleSendInstructions = async () => {
      setLoading(true);
      setError('');

      try {
         let emailToReset = identifier.trim();

         // Lógica para Telefone (se o usuário digitar números, converte para o shadow email)
         const isPhone = /^\d+$/.test(identifier.replace(/\D/g, ''));
         if (isPhone) {
            const cleanPhone = identifier.replace(/\D/g, '');
            if (cleanPhone.length < 10) throw new Error('Telefone inválido (mínimo 10 dígitos).');
            emailToReset = `${cleanPhone}@cliente.agenda.app`;
         } else if (!emailToReset.includes('@')) {
            throw new Error('Digite um e-mail ou telefone válido.');
         }

         const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
            redirectTo: window.location.origin + '/reset-password',
         });

         if (error) throw error;

         // Se deu certo, vai para a tela de feedback
         setSuccessEmail(emailToReset);
      } catch (err: any) {
         setError(err.message || 'Erro ao enviar instruções. Verifique os dados.');
      } finally {
         setLoading(false);
      }
   };

   if (successEmail) {
      return <AuthFeedback email={successEmail} onBack={onBack} onResend={handleSendInstructions} />;
   }

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
                     <span className="material-symbols-outlined text-4xl text-primary-brand">lock_reset</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">Redefinir Senha</h1>
                  <p className="text-slate-500 font-medium text-sm">
                     Insira seu e-mail ou telefone para recuperar o acesso.
                  </p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="relative group">
                        <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                           <div className="flex items-center px-4">
                              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">
                                 {identifier.includes('@') || identifier === '' ? 'mail' : 'smartphone'}
                              </span>
                              <div className="flex-1 py-2">
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">E-mail ou Telefone</label>
                                 <input
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="Ex: (11) 99999-9999"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                     {error && (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                           <div className="size-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-red-500 text-sm">priority_high</span>
                           </div>
                           <p className="text-red-500 text-xs font-bold">{error}</p>
                        </div>
                     )}
                  </div>

                  <button
                     onClick={handleSendInstructions}
                     disabled={loading}
                     className="w-full bg-gradient-to-r from-primary-brand to-rose-600 py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-primary-brand/30 hover:shadow-xl hover:shadow-primary-brand/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                     <span className="relative flex items-center justify-center gap-2">
                        {loading ? 'Enviando...' : 'Enviar Instruções'}
                        {!loading && <span className="material-symbols-outlined">send</span>}
                     </span>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AuthForgotPassword;
