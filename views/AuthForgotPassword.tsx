
import React from 'react';

interface AuthForgotPasswordProps {
  onBack: () => void;
}

const AuthForgotPassword: React.FC<AuthForgotPasswordProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col p-6 max-w-md mx-auto">
      <header className="flex items-center mb-8">
         <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
         <h2 className="flex-1 text-center font-bold pr-10">Redefinir Senha</h2>
      </header>

      <main className="flex-1 flex flex-col space-y-6">
         <div>
            <h1 className="text-3xl font-extrabold mb-3">Esqueceu sua senha?</h1>
            <p className="text-gray-500 leading-relaxed">Não se preocupe! Insira seu e-mail ou telefone. Enviaremos as instruções para você criar uma nova senha.</p>
         </div>

         <div className="space-y-2">
            <label className="text-xs font-bold ml-1">E-mail ou Telefone</label>
            <div className="relative flex items-center">
               <span className="absolute left-4 material-symbols-outlined text-gray-400">mail</span>
               <input className="w-full bg-white dark:bg-surface-dark py-4 pl-12 pr-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 border-none focus:ring-2 focus:ring-primary" placeholder="seu@email.com ou (11) 99999-9999" />
            </div>
            <p className="text-[10px] text-gray-500 ml-1">Enviaremos um código de verificação.</p>
         </div>

         <div className="flex-1" />

         <button className="w-full bg-primary py-4 rounded-xl text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2">Enviar Instruções <span className="material-symbols-outlined">send</span></button>
         <button onClick={onBack} className="w-full py-4 text-primary font-bold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-lg">arrow_back</span> Voltar ao Login</button>
      </main>
    </div>
  );
};

export default AuthForgotPassword;
