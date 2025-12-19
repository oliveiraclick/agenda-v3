
import React from 'react';
import Logo from '../components/Logo';

interface OnboardingProps {
  onStart: () => void;
  onLogin: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-10 right-6 z-20">
         <button onClick={onStart} className="text-sm font-bold text-slate-400 hover:text-primary-customer">Pular</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 bg-primary-customer/10 rounded-full blur-3xl" />
         <Logo size={200} className="mb-12 animate-in zoom-in-75 duration-700" />
      </div>

      <div className="bg-white dark:bg-[#1e1b2e] rounded-t-[3rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all animate-in slide-in-from-bottom duration-500">
         <div className="flex justify-center gap-2 mb-8">
            <div className="h-2 w-8 bg-primary-customer rounded-full shadow-lg" />
            <div className="h-2 w-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="h-2 w-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
         </div>

         <h1 className="text-3xl font-bold leading-tight mb-4 text-center">Gestão <span className="text-primary-customer">completa</span></h1>
         <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-10 max-w-[280px] mx-auto">Tudo que seu negócio precisa em um só lugar. Simples, rápido e eficiente.</p>

         <div className="space-y-4">
            <button onClick={onStart} className="w-full bg-primary-customer h-14 rounded-full text-white font-bold text-lg shadow-xl shadow-primary-customer/20 flex items-center justify-center gap-2 group transition-all active:scale-95">
               Começar
               <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button onClick={onLogin} className="w-full h-12 text-slate-500 dark:text-slate-300 font-bold">Já tenho uma conta</button>
         </div>
      </div>
    </div>
  );
};

export default Onboarding;
