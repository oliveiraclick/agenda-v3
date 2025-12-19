
import React, { useState } from 'react';

interface HelpCenterProps {
  onBack: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onBack }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    { q: 'Esqueci minha senha, e agora?', a: 'Não se preocupe! Na tela de login, clique em "Esqueci minha senha". Enviaremos um link de recuperação para o seu e-mail cadastrado.' },
    { q: 'Como cancelar um agendamento?', a: 'Vá em "Minhas Reservas", selecione o agendamento desejado e clique em "Cancelar". Observe o limite de 24h.' },
    { q: 'Como adicionar um novo serviço?', a: 'No painel do dono, vá em Configurações > Serviços > Adicionar Novo.' },
    { q: 'Problemas com pagamentos', a: 'Entre em contato com nosso suporte financeiro via chat online para resolução imediata.' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-white font-display flex flex-col">
      <div className="relative flex h-full w-full max-w-md mx-auto flex-col overflow-x-hidden pb-10">
        <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
          <button onClick={onBack} className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-10">Ajuda e Suporte</h2>
        </div>

        <div className="px-4 py-4">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-12 shadow-sm">
            <div className="text-primary-owner flex bg-white dark:bg-white/5 items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl rounded-l-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-0 focus:ring-0 border-none bg-white dark:bg-white/5 h-full px-4 pl-2 text-base font-medium" placeholder="Como podemos ajudar hoje?" />
          </div>
        </div>

        <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
          {['Geral', 'Profissionais', 'Donos', 'Clientes'].map((role, i) => (
            <button key={i} className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all ${i === 0 ? 'bg-primary-owner text-white shadow-lg' : 'bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300'}`}>
              <span className="text-sm font-semibold">{role}</span>
            </button>
          ))}
        </div>

        <div className="px-4 pt-2 pb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">Links Rápidos</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: 'play_circle', label: 'Tutoriais', img: 'https://picsum.photos/seed/tut/200' },
              { icon: 'article', label: 'Dicas', img: 'https://picsum.photos/seed/tips/200' },
              { icon: 'dns', label: 'Status', img: 'https://picsum.photos/seed/stat/200', iconColor: 'text-green-400' },
            ].map((link, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 aspect-square group cursor-pointer">
                <img className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110" src={link.img} alt={link.label} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                  <span className={`material-symbols-outlined text-[20px] mb-1 ${link.iconColor || 'text-white'}`}>{link.icon}</span>
                  <p className="text-white text-xs font-bold leading-tight">{link.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-6">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-4">Perguntas Frequentes</h3>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className={`rounded-2xl p-4 shadow-sm transition-all cursor-pointer ${expandedFaq === i ? 'bg-white dark:bg-white/5 ring-1 ring-primary-owner/20 dark:ring-primary-owner/40' : 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className={`font-bold text-base ${expandedFaq === i ? 'text-primary-owner' : 'text-slate-900 dark:text-white'}`}>{faq.q}</h4>
                  <span className="material-symbols-outlined text-slate-400 shrink-0">
                    {expandedFaq === i ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {expandedFaq === i && (
                  <div className="pt-3 pb-2 animate-fadeIn">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-8">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Fale Conosco</h3>
          <div className="flex flex-col gap-3">
            <button className="group relative flex w-full items-center gap-4 rounded-2xl bg-primary-owner p-4 transition-all active:scale-[0.98] shadow-lg shadow-primary-owner/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <span className="material-symbols-outlined text-white text-[24px]">chat</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-bold text-white">Chat Online</span>
                <span className="text-xs font-medium text-white/80">Tempo de espera: ~2 min</span>
              </div>
              <div className="ml-auto">
                <span className="material-symbols-outlined text-white">arrow_forward_ios</span>
              </div>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-white/5 p-4 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95">
                <div className="size-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <span className="text-sm font-semibold">E-mail</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white dark:bg-white/5 p-4 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95">
                <div className="size-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <span className="text-sm font-semibold">Ligar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
