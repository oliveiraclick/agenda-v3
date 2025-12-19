import React, { useState } from 'react';

interface AuthFeedbackProps {
  email: string; // Adicionado para receber o e-mail real
  onBack: () => void;
  onResend?: () => Promise<void>; // Função opcional de reenvio
}

const AuthFeedback: React.FC<AuthFeedbackProps> = ({ email, onBack, onResend }) => {
  const [resending, setResending] = useState(false);

  // Mascara o e-mail para privacidade (ex: user@gmail.com -> u***@gmail.com)
  const maskedEmail = email.replace(/^(.)(.*)(?=@)/, (match, first, middle) => {
    return first + "*".repeat(middle.length);
  });

  const handleResend = async () => {
    if (!onResend) return;
    setResending(true);
    await onResend();
    setResending(false);
    alert('E-mail reenviado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto items-center justify-center p-6 text-center">
      {/* Ícone com animação de check ou sucesso */}
      <div className="size-40 rounded-full bg-primary-owner/10 flex items-center justify-center mb-8 animate-in zoom-in-50 duration-500">
        <span className="material-symbols-outlined text-6xl text-primary-owner">mark_email_read</span>
      </div>

      <h2 className="text-3xl font-extrabold mb-3 tracking-tighter">Instruções Enviadas!</h2>
      <p className="text-slate-500 font-medium mb-10 px-4">
        Enviamos um link de recuperação para <br />
        <span className="font-bold text-slate-900 dark:text-white">{maskedEmail}</span>.
      </p>

      <button
        onClick={onBack}
        className="w-full bg-primary-owner h-14 rounded-2xl text-white font-bold shadow-lg shadow-primary-owner/20 active:scale-95 transition-transform"
      >
        Voltar ao Login
      </button>

      <p className="mt-8 text-sm text-slate-500 font-medium">
        Não recebeu? { }
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-primary-owner font-bold hover:underline disabled:opacity-50"
        >
          {resending ? 'Enviando...' : 'Reenviar'}
        </button>
      </p>
    </div>
  );
};

export default AuthFeedback;
