
import React from 'react';

interface CustomerLoyaltyProps {
  onBack: () => void;
}

const CustomerLoyalty: React.FC<CustomerLoyaltyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="flex items-center p-4 pb-2 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-50">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center font-bold text-lg pr-10">Meu Cartão Fidelidade</h2>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6">
        <div className="relative rounded-2xl bg-white dark:bg-surface-dark shadow-xl border dark:border-slate-800 overflow-hidden group">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full border-2 border-primary-customer bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/seed/barber/200")' }}></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Barbearia Elite</p>
                <h3 className="text-xl font-extrabold">Corte de Cabelo</h3>
              </div>
            </div>
            <span className="bg-primary-customer/10 text-primary-customer text-[10px] font-bold px-2 py-1 rounded-full uppercase">Válido: 30/12</span>
          </div>

          <div className="relative flex items-center justify-between w-full my-4">
            <div className="absolute -left-3 size-6 rounded-full bg-background-light dark:bg-background-dark"></div>
            <div className="w-full border-b-2 border-dashed dark:border-slate-800"></div>
            <div className="absolute -right-3 size-6 rounded-full bg-background-light dark:bg-background-dark"></div>
          </div>

          <div className="px-5 pb-6">
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="size-11 rounded-full bg-primary-customer text-white flex items-center justify-center shadow-lg shadow-primary-customer/20 relative">
                  <span className="material-symbols-outlined text-[20px]">content_cut</span>
                  {i === 7 && (
                    <div className="absolute -top-1 -right-1 size-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
                      <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                    </div>
                  )}
                </div>
              ))}
              {[8, 9].map(i => (
                <div key={i} className="size-11 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs opacity-50">
                  {i}
                </div>
              ))}
              <div className="size-11 rounded-full border-2 border-primary-customer bg-primary-customer/5 flex items-center justify-center text-primary-customer">
                <span className="material-symbols-outlined">redeem</span>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 text-center">
            <p className="text-sm text-slate-500">Complete 10 selos para ganhar <span className="text-primary-customer font-bold">1 corte grátis</span>.</p>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-bold text-base">Seu progresso</p>
              <p className="text-sm text-slate-500">Faltam apenas 3 visitas!</p>
            </div>
            <p className="text-primary-customer text-2xl font-bold">7/10</p>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary-customer transition-all duration-700 shadow-[0_0_15px_rgba(127,19,236,0.5)]" style={{ width: '70%' }}></div>
          </div>
        </section>

        <section className="flex flex-col gap-2 pt-2">
           <h3 className="font-bold text-lg mb-1">Detalhes</h3>
           {[
             { icon: 'description', label: 'Regras de uso', sub: 'Validade e prêmios' },
             { icon: 'storefront', label: 'Locais Participantes', sub: 'Barbearia Elite - Unidade SP' },
             { icon: 'history', label: 'Histórico', sub: 'Último selo hoje' }
           ].map((item, i) => (
             <div key={i} className="bg-white dark:bg-surface-dark rounded-xl p-4 border dark:border-slate-800 flex items-center gap-4 cursor-pointer">
               <div className="size-10 rounded-lg bg-primary-customer/10 text-primary-customer flex items-center justify-center">
                 <span className="material-symbols-outlined">{item.icon}</span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold">{item.label}</p>
                 <p className="text-xs text-slate-500">{item.sub}</p>
               </div>
               <span className="material-symbols-outlined text-slate-400">chevron_right</span>
             </div>
           ))}
        </section>
      </main>

      <div className="sticky bottom-0 p-4 bg-background-light dark:bg-background-dark border-t dark:border-slate-800 z-50">
        <button className="w-full bg-primary-customer py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold shadow-xl shadow-primary-customer/20 transition-transform active:scale-95">
          <span className="material-symbols-outlined">qr_code_scanner</span>
          Ler QR Code para Pontuar
        </button>
      </div>
    </div>
  );
};

export default CustomerLoyalty;
