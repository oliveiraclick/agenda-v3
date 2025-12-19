
import React from 'react';

interface AuthFeedbackProps {
  onBack: () => void;
}

const AuthFeedback: React.FC<AuthFeedbackProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto items-center justify-center p-6 text-center">
      <div className="size-40 rounded-full bg-primary-owner/10 flex items-center justify-center mb-8 animate-in zoom-in-50 duration-500">
        <div className="size-24 bg-cover" style={{ backgroundImage: 'url("https://picsum.photos/seed/success/200")' }}></div>
      </div>
      
      <h2 className="text-3xl font-extrabold mb-3">Instruções Enviadas!</h2>
      <p className="text-slate-500 font-medium mb-10 px-4">
        Enviamos um link de recuperação para o e-mail <span className="font-bold text-slate-900 dark:text-white">u*****@gmail.com</span>. Verifique seu lixo eletrônico se necessário.
      </p>

      <button 
        onClick={onBack}
        className="w-full bg-primary-owner h-12 rounded-xl text-white font-bold shadow-lg shadow-primary-owner/20 active:scale-95 transition-transform"
      >
        Voltar ao Login
      </button>

      <p className="mt-8 text-sm text-slate-500 font-medium">
        Não recebeu? <button className="text-primary-owner font-bold hover:underline">Reenviar</button>
      </p>
    </div>
  );
};

export default AuthFeedback;
