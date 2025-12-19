
import React from 'react';

const ProfessionalAgenda: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col pb-24 view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md p-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-2xl ring-2 ring-primary-brand/20 bg-cover bg-center shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/pro/100")' }}></div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Profissional</p>
              <h2 className="font-bold text-lg text-slate-900 leading-none mt-1">Bruno Santos</h2>
            </div>
          </div>
          <button className="size-11 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-500"><span className="material-symbols-outlined">notifications</span></button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-md mx-auto w-full">
        <section>
          <div className="flex justify-between items-center mb-5">
             <h3 className="font-black text-xl text-slate-900">Outubro 2023</h3>
             <div className="flex gap-2">
                <button className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
             </div>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x py-2">
             {[13, 14, 15, 16, 17].map((d, i) => (
               <button key={i} className={`flex flex-col items-center justify-center min-w-[68px] h-[92px] rounded-3xl transition-all ${i === 1 ? 'bg-primary-brand text-white shadow-red-glow scale-110' : 'bg-white border border-slate-100 shadow-sm text-slate-400'}`}>
                  <span className={`text-[10px] font-bold uppercase ${i === 1 ? 'text-white/80' : 'text-slate-300'}`}>Qua</span>
                  <span className="text-xl font-black mt-1">{d}</span>
                  {i === 1 && <div className="size-1.5 bg-white rounded-full mt-2" />}
               </button>
             ))}
          </div>
        </section>

        <section className="bg-primary-brand p-6 rounded-[2rem] shadow-red-glow relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-white text-5xl">task_alt</span></div>
           <div className="flex justify-between items-end mb-4 relative z-10">
              <p className="text-white font-bold text-base">Progresso do Dia</p>
              <p className="text-white text-xs font-black bg-white/20 px-2 py-0.5 rounded-full tracking-tighter">5 de 8</p>
           </div>
           <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-white rounded-full shadow-[0_0_10px_white]" style={{ width: '62.5%' }}></div>
           </div>
        </section>

        <section className="space-y-6 relative pb-10">
          <div className="absolute left-9 top-4 bottom-0 w-1 bg-slate-100 rounded-full" />
          
          <div className="relative flex gap-5 opacity-40 grayscale">
             <div className="w-10 flex flex-col items-center pt-2"><span className="text-[11px] font-black text-slate-400">09:00</span><div className="size-3 rounded-full bg-slate-200 ring-4 ring-white mt-3" /></div>
             <div className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="size-11 rounded-2xl bg-slate-100" />
                   <div><p className="text-sm font-bold text-slate-900">Carlos Silva</p><p className="text-[10px] font-bold text-slate-400 uppercase">Corte • Concluído</p></div>
                </div>
                <span className="material-symbols-outlined text-emerald-500 material-symbols-filled">check_circle</span>
             </div>
          </div>

          <div className="relative flex gap-5">
             <div className="w-10 flex flex-col items-center pt-2"><span className="text-[11px] font-black text-primary-brand">10:00</span><div className="size-3 rounded-full bg-primary-brand ring-4 ring-white mt-3 shadow-red-glow" /></div>
             <div className="flex-1 bg-white p-0 rounded-[2rem] border-2 border-primary-brand overflow-hidden shadow-card">
                <div className="h-1.5 bg-primary-brand w-full" />
                <div className="p-5 space-y-4">
                   <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black bg-rose-50 text-primary-brand px-3 py-1 rounded-full uppercase tracking-wider">Atendimento Atual</span>
                      <span className="material-symbols-outlined text-slate-300">more_horiz</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-slate-100 shadow-inner" />
                      <div><p className="font-extrabold text-slate-900 text-lg">Mariana Souza</p><p className="text-xs font-bold text-slate-400">Coloração & Mechas</p></div>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 bg-primary-brand text-white py-3.5 rounded-2xl text-sm font-black shadow-red-glow active:scale-95 transition-all">Finalizar</button>
                      <button className="size-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-brand transition-colors"><span className="material-symbols-outlined">chat</span></button>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 right-6 size-16 bg-primary-brand text-white rounded-full shadow-red-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
         <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default ProfessionalAgenda;