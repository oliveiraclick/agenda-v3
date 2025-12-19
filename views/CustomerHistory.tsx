
import React, { useState } from 'react';

interface CustomerHistoryProps {
  onBack: () => void;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'futuros' | 'passados'>('futuros');

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 flex items-center border-b dark:border-slate-800">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center font-bold text-lg pr-10">Meus Agendamentos</h2>
      </header>

      <div className="p-4">
        <div className="flex bg-slate-200 dark:bg-[#232f48] p-1 rounded-xl">
          <button onClick={() => setTab('futuros')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${tab === 'futuros' ? 'bg-white dark:bg-background-dark shadow-sm' : 'text-slate-500'}`}>Futuros</button>
          <button onClick={() => setTab('passados')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${tab === 'passados' ? 'bg-white dark:bg-background-dark shadow-sm' : 'text-slate-500'}`}>Passados</button>
        </div>
      </div>

      <main className="p-4 space-y-4 pb-24 overflow-y-auto">
        {tab === 'futuros' ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#192233] p-4 rounded-2xl border dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-500">Confirmado</span>
                    <h4 className="font-bold text-lg mt-2">Barbearia do Zé</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> 15 Out • 14:00</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> Corte Degradê com João</p>
                  </div>
                  <div className="size-20 rounded-xl bg-slate-200 dark:bg-[#232f48] shrink-0 overflow-hidden"><img src="https://picsum.photos/seed/barber1/200" /></div>
               </div>
               <button className="w-full py-3 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all">Cancelar Agendamento</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 opacity-90">
             {[
               { name: 'Espaço Unhas', service: 'Manicure', date: '05 Set • 09:00' },
               { name: 'Barbearia do Zé', service: 'Barba e Cabelo', date: '20 Ago • 18:00' }
             ].map((past, i) => (
                <div key={i} className="bg-white dark:bg-[#192233] p-4 rounded-2xl border dark:border-slate-800 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-bold uppercase text-slate-400">Concluído</span>
                    <h4 className="font-bold text-base mt-1">{past.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{past.date}</p>
                  </div>
                  <button className="bg-primary-customer text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">Avaliar</button>
                </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerHistory;
