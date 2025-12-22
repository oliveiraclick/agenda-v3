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
   const [phone, setPhone] = useState('');
   const [birthDate, setBirthDate] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);
   const [successMessage, setSuccessMessage] = useState('');

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();

      let finalEmail = email;
      let finalPassword = password;

      // Logic for Simplified Customer Signup
      if (role === 'customer') {
         if (!name || !phone || !birthDate) {
            setError('Preencha nome, telefone e data de nascimento.');
            return;
         }
         // Auto-generate credentials
         const cleanPhone = phone.replace(/\D/g, '');
         if (cleanPhone.length < 10) {
            setError('Telefone inválido.');
            return;
         }
         finalEmail = `${cleanPhone}@agenda.app`; // Dummy email
         finalPassword = cleanPhone; // Phone as password
      } else {
         // Owner logic (keep checks)
         if (!email || !password || !name) {
            setError('Preencha todos os campos.');
            return;
         }
         finalEmail = email;
         finalPassword = password;
      }

      setLoading(true);
      setError('');

      try {
         // 0. Verificar se o telefone já existe (via RPC segura)
         if (role === 'customer') {
            const { data: phoneExists, error: rpcError } = await supabase
               .rpc('check_phone_exists', { phone_number: phone });

            if (rpcError) {
               console.error('Erro ao verificar telefone:', rpcError);
               // Segue em frente se der erro no RPC (falha aberta), ou bloqueia? Melhor bloquear se for crítico.
               // Mas se o RPC não existir ainda, vai bloquear tudo. Vamos logar e seguir com Auth check.
            }

            if (phoneExists) {
               setError('Este telefone já está cadastrado. Faça login.');
               setLoading(false);
               return;
            }
         }

         // 1. Criar usuário no Auth com metadados de Role
         let authData;
         let authError;

         // Timeout de segurança (15 segundos)
         const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão.')), 15000)
         );

         const signUpPromise = supabase.auth.signUp({
            email: finalEmail,
            password: finalPassword,
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
            // Se chegou aqui, é porque o e-mail (telefone@agenda) bateu.
            // O RPC acima já deveria ter pego, mas se falhou, aqui pegamos pelo Auth.
            throw new Error('Este número já tem uma conta. Faça login.');
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
            // Envia chaves duplicadas para garantir compatibilidade com colunas portuguesas/inglesas
            const { error: profileError } = await supabase
               .from('profiles')
               .upsert({
                  id: data.user.id,
                  name: name,
                  role: role,
                  email: finalEmail,
                  // Compatibilidade Dupla
                  phone: phone,
                  telefone: phone,
                  birth_date: birthDate,
                  data_nascimento: birthDate,
                  updated_at: new Date(),
               });

            if (profileError) {
               console.error("Erro no Profile:", profileError.message);
            }

            // 3. Login Explícito (Garantia)
            if (data.session) {
               await supabase.auth.signInWithPassword({ email: finalEmail, password: finalPassword });
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
                     <Logo size={60} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">
                     {role === 'owner' ? 'Sua empresa no mapa' : 'Crie sua conta'}
                  </h1>
                  <p className="text-slate-500 font-medium text-sm">
                     {role === 'owner'
                        ? 'Gerencie seus agendamentos e cresça seu negócio.'
                        : 'Agende serviços em segundos nos melhores locais.'}
                  </p>
               </div>



               <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                     <div className="relative group">
                        <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                           <div className="flex items-center px-4">
                              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">
                                 {role === 'owner' ? 'storefront' : 'person'}
                              </span>
                              <div className="flex-1 py-2">
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nome Completo / Razão Social</label>
                                 <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="Ex: Barbearia do João"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {role === 'owner' && (
                     <div className="space-y-2">
                        <div className="relative group">
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">mail</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">E-mail Profissional</label>
                                    <input
                                       type="email"
                                       value={email}
                                       onChange={e => setEmail(e.target.value)}
                                       className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                       placeholder="empresa@email.com"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <div className="relative group">
                        <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                           <div className="flex items-center px-4">
                              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">smartphone</span>
                              <div className="flex-1 py-2">
                                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Celular / WhatsApp</label>
                                 <input
                                    value={phone}
                                    onChange={e => {
                                       let v = e.target.value.replace(/\D/g, '');
                                       v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                                       v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                                       setPhone(v);
                                    }}
                                    maxLength={15}
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="(11) 99999-9999"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {role === 'customer' && (
                     <div className="space-y-2">
                        <div className="relative group">
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">cake</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Data de Nascimento</label>
                                    <input
                                       type="date"
                                       value={birthDate}
                                       onChange={e => setBirthDate(e.target.value)}
                                       className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {role === 'owner' && (
                     <div className="space-y-2">
                        <div className="relative group">
                           <div className="relative bg-white border border-slate-200 rounded-2xl p-1 transition-all group-focus-within:border-primary-brand group-focus-within:shadow-lg group-focus-within:shadow-primary-brand/10">
                              <div className="flex items-center px-4">
                                 <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors mr-3">lock</span>
                                 <div className="flex-1 py-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Senha de Acesso</label>
                                    <div className="flex items-center">
                                       <input
                                          type={showPassword ? 'text' : 'password'}
                                          value={password}
                                          onChange={e => setPassword(e.target.value)}
                                          className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                                          placeholder="Mínimo 6 caracteres"
                                       />
                                       <button
                                          type="button"
                                          onClick={() => setShowPassword(!showPassword)}
                                          className="text-slate-400 hover:text-primary-brand transition-colors"
                                       >
                                          <span className="material-symbols-outlined text-xl">
                                             {showPassword ? 'visibility' : 'visibility_off'}
                                          </span>
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
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
                     className="w-full bg-gradient-to-r from-primary-brand to-rose-600 py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-primary-brand/30 hover:shadow-xl hover:shadow-primary-brand/40 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70 relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                     <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                           <span className="flex items-center justify-center gap-2">
                              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Criando conta...
                           </span>
                        ) : 'Criar Conta'}
                     </span>
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
};

export default AuthSignup;
