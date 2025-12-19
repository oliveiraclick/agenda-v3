
import React from 'react';

interface AuthSignupProps {
  onBack: () => void;
  onComplete: () => void;
}

const AuthSignup: React.FC<AuthSignupProps> = ({ onBack, onComplete }) => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col p-6 max-w-md mx-auto relative overflow-hidden view-transition">
      {/* Background Decorativo Sutil */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 bg-primary-brand/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top App Bar */}
      <header className="flex items-center justify-between mb-10 z-10">
         <button onClick={onBack} className="size-11 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-slate-900">arrow_back</span>
         </button>
         <h2 className="font-bold text-slate-900 text-base">Criar Conta</h2>
         <button className="size-11 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
            <span className="material-symbols-outlined text-slate-900">person</span>
         </button>
      </header>

      <main className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10 z-10">
         {/* Ícone Central e Headline */}
         <div className="text-center space-y-6">
            <div className="mx-auto size-20 bg-white rounded-3xl flex items-center justify-center shadow-card border border-slate-50">
               <span className="material-symbols-outlined text-4xl text-primary-brand font-light">business_center</span>
            </div>
            
            <div className="space-y-3 px-2">
               <h1 className="text-[32px] font-black leading-tight tracking-tighter text-slate-900">
                  Sua Gestão em um só lugar
               </h1>
               <p className="text-slate-400 font-medium leading-relaxed px-4">
                  Gerencie sua agenda, profissionais e clientes. Comece agora gratuitamente.
               </p>
            </div>
         </div>

         {/* Form Section */}
         <div className="space-y-5 pt-2">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-900 ml-1">Nome do Negócio</label>
               <div className="relative flex items-center group">
                  <input 
                     className="w-full bg-white border border-slate-200 py-4 pl-5 pr-14 rounded-2xl focus:ring-2 focus:ring-primary-brand focus:border-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm transition-all" 
                     placeholder="Ex: Estúdio Alpha ou Seu Nome" 
                  />
                  <span className="absolute right-5 material-symbols-outlined text-slate-300">storefront</span>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-900 ml-1">E-mail Profissional</label>
               <div className="relative flex items-center group">
                  <input 
                     className="w-full bg-white border border-slate-200 py-4 pl-5 pr-14 rounded-2xl focus:ring-2 focus:ring-primary-brand focus:border-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm transition-all" 
                     placeholder="seu@negocio.com" 
                     type="email"
                  />
                  <span className="absolute right-5 material-symbols-outlined text-slate-300">mail</span>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-900 ml-1">Senha</label>
               <div className="relative flex items-center group">
                  <input 
                     className="w-full bg-white border border-slate-200 py-4 pl-5 pr-14 rounded-2xl focus:ring-2 focus:ring-primary-brand focus:border-primary-brand text-slate-900 font-medium placeholder:text-slate-300 shadow-sm transition-all" 
                     placeholder="Mínimo 8 caracteres" 
                     type="password"
                  />
                  <span className="absolute right-5 material-symbols-outlined text-slate-300 cursor-pointer">visibility_off</span>
               </div>
            </div>
         </div>

         {/* Botão de Ação */}
         <div className="pt-6 space-y-8">
            <button 
               onClick={onComplete} 
               className="w-full bg-primary-brand py-5 rounded-[2rem] text-white font-black text-lg shadow-red-glow flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
               Criar Conta Grátis
               <span className="material-symbols-outlined font-black">arrow_forward</span>
            </button>

            <p className="text-center text-sm text-slate-400 font-medium pb-4">
               Já tem uma conta? <button onClick={onBack} className="text-slate-900 font-black hover:text-primary-brand transition-colors">Entrar</button>
            </p>
         </div>
      </main>
    </div>
  );
};

export default AuthSignup;
