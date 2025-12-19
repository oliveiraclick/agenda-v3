import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

interface AuthSignupProps {
   onBack: () => void;
   onComplete: () => void;
   role?: 'owner' | 'customer';
}

const AuthSignup: React.FC<AuthSignupProps> = ({ onBack, onComplete, role = 'customer' }) => {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);
   const [successMessage, setSuccessMessage] = useState('');

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password || !name) {
         setError('Preencha todos os campos.');
         return;
      }

      setLoading(true);
      setError('');

      try {
         // 1. Criar usuário no Auth com metadados de Role
         let authData;
         let authError;

         // Timeout de segurança (15 segundos)
         const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão.')), 15000)
         );

         const signUpPromise = supabase.auth.signUp({
            email,
            password,
            options: {
               data: {
                  name: name,
                  role: role,
               }
            }
         });

         const signUpResponse = await Promise.race([signUpPromise, timeoutPromise]) as any;

         authData = signUpResponse.data;
         authError = signUpResponse.error;

         // TRATAMENTO ESPECIAL: Usuário já existe (Auto-Login)
         if (authError && authError.message.includes('already registered')) {
            const signInResponse = await supabase.auth.signInWithPassword({
               email,
               password
            });

            if (signInResponse.error) {
               throw new Error('Conta já existe. Se for você, faça login.');
            }

            authData = signInResponse.data;
            authError = null;
         }

         if (authError) throw authError;

         const data = authData;

         // CASO 1: Confirmação de E-mail Necessária (Sem Sessão)
         if (data.user && !data.session) {
            setSuccessMessage('Verifique seu e-mail para confirmar o cadastro.');
            setSuccess(true);
            return;
         }

         if (data.user) {
            // 2. Criar o perfil na tabela pública imediatamente
            const { error: profileError } = await supabase
               .from('profiles')
               .upsert({
                  id: data.user.id,
                  name: name,
                  role: role,
                  email: email,
                  updated_at: new Date(),
               });

            if (profileError) {
               console.error("Erro no Profile:", profileError.message);
               // Não lança erro fatal se for apenas RLS impedindo leitura, mas loga
            }

            // 3. Login Explícito (Garantia)
            if (data.session) {
               await supabase.auth.signInWithPassword({ email, password });
            }

            // Sucesso!
            if (role === 'owner') {
               setSuccessMessage('Sua conta empresarial foi criada com sucesso!');
               setSuccess(true);
            } else {
               onComplete();
            }
         }
      } catch (err: any) {
         setError(err.message || 'Erro ao criar conta.');
      } finally {
         setLoading(false);
      }
   };

   if (success) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white animate-in fade-in">
            <div className="size-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
               <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sucesso!</h2>
            <p className="text-slate-500 text-center mb-8">{successMessage}</p>
            <button onClick={onComplete} className="w-full max-w-xs bg-primary-owner text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-owner/30">
               {successMessage.includes('e-mail') ? 'Voltar ao Login' : 'Acessar Painel'}
            </button>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col p-6 max-w-md mx-auto">
         <header className="py-4 flex items-center">
            <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            </button>
            <span className="flex-1 text-center font-bold text-xs uppercase tracking-widest text-slate-400">
               Cadastro de {role === 'owner' ? 'Empresa' : 'Cliente'}
            </span>
         </header>

         <main className="flex-1 flex flex-col pt-4">
            <div className="mb-8">
               <Logo size={80} className="mb-6" />
               <h1 className="text-3xl font-black tracking-tighter">
                  {role === 'owner' ? 'Sua empresa no mapa' : 'Crie sua conta'}
               </h1>
               <p className="text-slate-500 font-medium">
                  {role === 'owner'
                     ? 'Gerencie seus agendamentos e cresça seu negócio.'
                     : 'Agende serviços em segundos nos melhores locais.'}
               </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nome Completo / Razão Social</label>
                  <input
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className="w-full bg-white dark:bg-surface-dark py-4 px-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-brand outline-none shadow-sm"
                     placeholder="Ex: Barbearia do João"
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">E-mail Profissional</label>
                  <input
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full bg-white dark:bg-surface-dark py-4 px-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-brand outline-none shadow-sm"
                     placeholder="empresa@email.com"
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Senha de Acesso</label>
                  <div className="relative flex items-center">
                     <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark py-4 px-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-brand outline-none shadow-sm"
                        placeholder="Mínimo 6 caracteres"
                     />
                     <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 material-symbols-outlined text-slate-400 cursor-pointer"
                     >
                        {showPassword ? 'visibility' : 'visibility_off'}
                     </span>
                  </div>
               </div>

               {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-brand py-5 rounded-2xl text-white font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
               >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
               </button>
            </form>
         </main>
      </div>
   );
};

export default AuthSignup;
