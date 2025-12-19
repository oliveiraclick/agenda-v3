
import React from 'react';

const ProfessionalCommissions: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-[#191022] text-slate-900 dark:text-white flex flex-col pb-24">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-[#191022]/80 backdrop-blur-md p-4 flex items-center justify-between border-b dark:border-white/5">
        <div className="flex items-center gap-3">
           <div className="size-10 rounded-full border-2 border-primary bg-cover" style={{ backgroundImage: 'url("https://picsum.photos/seed/pro/100")' }}></div>
        </div>
        <h1 className="text-xs font-bold uppercase tracking-widest text-center flex-1">Minhas Comissões</h1>
        <button className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">visibility_off</span></button>
      </header>

      <main className="p-4 space-y-6 overflow-y-auto">
        <section>
           <h2 className="text-3xl font-extrabold leading-tight">Olá, Ricardo!</h2>
           <p className="text-sm text-gray-500 mt-1">14 de Outubro, 2023</p>
        </section>

        <section className="flex p-1 bg-gray-200 dark:bg-[#251833] rounded-full">
           <button className="flex-1 py-2 rounded-full bg-white dark:bg-primary shadow-sm text-xs font-bold">Hoje</button>
           <button className="flex-1 py-2 rounded-full text-xs font-semibold text-gray-500">Semana</button>
           <button className="flex-1 py-2 rounded-full text-xs font-semibold text-gray-500">Mês</button>
        </section>

        <section className="grid grid-cols-2 gap-4">
           <div className="bg-white dark:bg-[#251833] p-5 rounded-[2rem] border dark:border-white/5 relative overflow-hidden">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary opacity-10 text-5xl">payments</span>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Ganho Hoje</p>
              <p className="text-3xl font-extrabold mt-2"><span className="text-lg opacity-60">R$</span> 450</p>
           </div>
           <div className="bg-primary p-5 rounded-[2rem] shadow-lg shadow-primary/20 relative overflow-hidden">
              <span className="material-symbols-outlined absolute top-4 right-4 text-white opacity-20 text-5xl">calendar_month</span>
              <p className="text-[10px] font-bold text-white/80 uppercase">Ganho no Mês</p>
              <p className="text-3xl font-extrabold text-white mt-2"><span className="text-lg opacity-80">R$</span> 3.250</p>
           </div>
        </section>

        <section className="bg-white dark:bg-[#251833] p-5 rounded-2xl border dark:border-white/5">
           <div className="flex justify-between items-end mb-3">
              <div><p className="font-bold text-sm">Meta Mensal</p><p className="text-[10px] text-gray-500">Faltam R$ 1.750,00</p></div>
              <span className="text-xl font-bold text-primary">65%</span>
           </div>
           <div className="h-3 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '65%' }}></div>
           </div>
        </section>

        <section className="space-y-4">
           <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Serviços Recentes</h3><span className="text-xs font-bold text-primary">Ver tudo</span></div>
           {[
             { name: 'Corte Masculino', client: 'João Silva', time: '14:30', val: '+ R$ 25,00', tot: 'R$ 50,00' },
             { name: 'Coloração', client: 'Maria Souza', time: '10:15', val: '+ R$ 120,00', tot: 'R$ 300,00' }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-[#251833] p-4 rounded-xl border dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="size-12 rounded-full bg-slate-200" />
                   <div><p className="text-sm font-bold">{s.name}</p><p className="text-[10px] text-gray-500">{s.client} • {s.time}</p></div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-green-500">{s.val}</p>
                   <p className="text-[8px] text-gray-400">Total: {s.tot}</p>
                </div>
             </div>
           ))}
        </section>
      </main>
    </div>
  );
};

export default ProfessionalCommissions;
