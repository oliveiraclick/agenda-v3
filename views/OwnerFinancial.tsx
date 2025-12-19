
import React from 'react';

interface OwnerFinancialProps {
  onBack: () => void;
}

const OwnerFinancial: React.FC<OwnerFinancialProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="flex items-center justify-between p-4 pt-6 pb-2 bg-background-light dark:bg-[#111722] sticky top-0 z-20">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Financeiro</h2>
        <button className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">settings</span></button>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="flex items-center justify-center py-4 px-4 bg-background-light dark:bg-[#111722]">
           <span className="material-symbols-outlined text-slate-400">chevron_left</span>
           <h2 className="text-xl font-bold px-4">Setembro 2023</h2>
           <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary-owner p-6 shadow-lg shadow-primary-owner/20">
             <p className="text-blue-100 text-sm font-medium mb-1">Saldo Total</p>
             <h1 className="text-white text-3xl font-extrabold tracking-tight">R$ 12.450,00</h1>
             <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs font-medium">
                <span className="material-symbols-outlined text-sm bg-white/20 rounded-full p-0.5">trending_up</span>
                <span>+15% em relação a Agosto</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl border dark:border-slate-800">
               <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Entradas</p>
               <p className="text-emerald-500 text-xl font-bold">R$ 15.000</p>
            </div>
            <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl border dark:border-slate-800">
               <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Saídas</p>
               <p className="text-red-500 text-xl font-bold">-R$ 2.550</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-lg px-2">Extrato</h3>
            {[
              { label: 'Corte + Barba', value: '+ R$ 80,00', type: 'in', user: 'João Silva', time: '14:30' },
              { label: 'Conta de Luz', value: '- R$ 250,00', type: 'out', user: 'CEMIG', time: 'Despesa fixa' },
              { label: 'Comissão', value: '- R$ 1.200,00', type: 'com', user: 'Barbeiro Pedro', time: '40%' }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-[#232f48] p-4 rounded-xl flex items-center justify-between border dark:border-slate-800">
                <div className="flex items-center gap-3">
                   <div className={`size-10 rounded-full flex items-center justify-center ${t.type === 'in' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                      <span className="material-symbols-outlined">{t.type === 'in' ? 'payments' : 'receipt_long'}</span>
                   </div>
                   <div>
                     <p className="font-bold text-sm">{t.label}</p>
                     <p className="text-xs text-slate-400">{t.user} • {t.time}</p>
                   </div>
                </div>
                <p className={`font-bold ${t.type === 'in' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-20">
         <button className="flex items-center gap-2 h-14 pr-6 pl-4 rounded-full bg-primary-owner text-white shadow-xl shadow-primary-owner/40 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-3xl">add</span>
            <span className="font-bold">Lançamento</span>
         </button>
      </div>
    </div>
  );
};

export default OwnerFinancial;
