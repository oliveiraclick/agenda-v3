
import React, { useState } from 'react';

interface ResetPasswordProps {
  onBack: () => void;
  onReset: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack, onReset }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="p-4 flex items-center justify-between">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="font-bold text-lg pr-10">Redefinição</h2>
      </header>

      <main className="p-6 flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 leading-tight">Definir Nova Senha</h1>
          <p className="text-slate-500 font-medium">Sua nova senha deve ser diferente de senhas usadas anteriormente.</p>
        </div>

        <div className="space-y-5">
           <label className="block space-y-2">
              <span className="text-sm font-bold px-1">Nova Senha</span>
              <div className="relative">
                <input type="password" placeholder="Digite sua nova senha" value="Senh" className="w-full h-14 rounded-xl bg-white dark:bg-[#192233] border-slate-200 dark:border-slate-800 focus:ring-primary px-4" />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><span className="material-symbols-outlined">visibility_off</span></button>
              </div>
           </label>
           <label className="block space-y-2">
              <span className="text-sm font-bold px-1">Confirmar Nova Senha</span>
              <div className="relative">
                <input type="password" placeholder="Digite a senha novamente" className="w-full h-14 rounded-xl bg-white dark:bg-[#192233] border-slate-200 dark:border-slate-800 focus:ring-primary px-4" />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><span className="material-symbols-outlined">visibility_off</span></button>
              </div>
           </label>
        </div>

        <div className="space-y-3">
           <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Requisitos da senha</p>
           <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Mínimo de 8 caracteres</li>
              <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-slate-400 text-lg">circle</span> Pelo menos um número</li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-400"><span className="material-symbols-outlined text-lg">circle</span> Pelo menos um caractere especial</li>
           </ul>
        </div>

        <button onClick={onReset} className="w-full bg-primary-owner h-14 rounded-xl text-white font-bold shadow-xl shadow-primary-owner/20 active:scale-95 transition-all">Redefinir Senha</button>
      </main>

      <div className="mt-auto bg-[#d1d5db] dark:bg-[#1c1c1e] p-2 rounded-t-3xl shadow-inner">
         <div className="flex justify-center gap-6 py-2 border-b dark:border-white/5 mb-2">
            <span className="text-xs font-bold">Senha forte</span>
            <span className="text-xs font-bold text-slate-400">Senhas</span>
         </div>
         <div className="grid grid-cols-10 gap-1 px-1">
           {['q','w','e','r','t','y','u','i','o','p'].map(k => (
             <div key={k} className="h-10 bg-white dark:bg-[#4d4d4d] rounded flex items-center justify-center font-medium shadow-sm">{k}</div>
           ))}
         </div>
         <div className="h-4" />
      </div>
    </div>
  );
};

export default ResetPassword;
