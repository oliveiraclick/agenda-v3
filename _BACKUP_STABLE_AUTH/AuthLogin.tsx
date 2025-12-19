import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthLoginProps {
   onLogin: () => void; // Mantendo compatibilidade com App.tsx
   onForgotPassword: () => void;
   onSignup: () => void; // Mantendo compatibilidade com App.tsx
   // Props extras que o App.tsx pode passar, mas vamos mapear internamente
   onRegisterDetails?: () => void;
   onBack?: () => void;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onLogin, onForgotPassword, onSignup }) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         // 1. Tenta autenticar
         const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
         });

         if (authError) throw authError;

         if (authData.user) {
            // 2. Busca o perfil para saber se é 'owner' ou 'customer'
            const { data: profile, error: profileError } = await supabase
               .from('profiles')
               .select('role')
               .eq('id', authData.user.id)
               .maybeSingle();

            if (profileError) {
               console.error("Erro ao buscar perfil:", profileError);
               // Se o perfil falhar, mas o auth deu certo, assumimos customer para não travar
               // O App.tsx vai lidar com o redirecionamento baseado no estado global
               onLogin();
               return;
            }

            // Se encontrou o perfil, o App.tsx já tem um listener no onAuthStateChange
            // que vai atualizar a view automaticamente.
            // Mas chamamos onLogin para garantir.
            onLogin();
         }
      } catch (err: any) {
         console.error("Erro completo:", err);
         setError(err.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : 'Erro ao conectar: ' + err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-white flex flex-col p-8 max-w-md mx-auto justify-center">
         <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Bem-vindo de volta</h1>
            <p className="text-slate-500 font-medium">Acesse sua conta para continuar.</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-4">
            <input
               type="email"
               placeholder="Seu e-mail"
               className="w-full bg-slate-50 border-none py-4 px-6 rounded-2xl focus:ring-2 focus:ring-primary-brand outline-none"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
            />
            <input
               type="password"
               placeholder="Sua senha"
               className="w-full bg-slate-50 border-none py-4 px-6 rounded-2xl focus:ring-2 focus:ring-primary-brand outline-none"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
            />

            <button
               type="button"
               onClick={onForgotPassword}
               className="text-xs font-bold text-slate-400 hover:text-primary-brand transition-colors ml-2"
            >
               Esqueceu a senha?
            </button>

            {error && (
               <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-red-500 text-xs font-bold text-center">{error}</p>
               </div>
            )}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-slate-900 py-5 rounded-2xl text-white font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
               {loading ? 'Entrando...' : 'Entrar'}
            </button>
         </form>

         <p className="text-center mt-8 text-slate-500 font-medium">
            Não tem conta? <button onClick={onSignup} className="text-primary-brand font-black hover:underline">Cadastre-se</button>
         </p>
      </div>
   );
};

export default AuthLogin;
