
import React from 'react';

interface OwnerMarketingProps {
  onBack: () => void;
}

const OwnerMarketing: React.FC<OwnerMarketingProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      {/* Header Escuro */}
      <header className="bg-[#111722] p-6 pt-10 pb-12 rounded-b-[2.5rem] relative">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#1e293b]">Marketing</h2>
          <button className="text-primary-brand font-black text-sm hover:opacity-80 transition-opacity">Ajuda</button>
        </div>
      </header>

      <main className="flex-1 -mt-8 px-5 pb-32 overflow-y-auto no-scrollbar space-y-8">
        {/* Métricas Principais */}
        <div className="flex gap-4 items-start">
           <div className="flex-1 bg-[#1e293b] p-5 rounded-3xl shadow-lg border border-white/5">
              <span className="material-symbols-outlined text-primary-brand text-xl mb-2">campaign</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campanhas</p>
              <p className="text-3xl font-black text-white mt-1">3</p>
           </div>
           <div className="flex-1 bg-[#1e293b] p-5 rounded-3xl shadow-lg border border-white/5 relative">
              <span className="material-symbols-outlined text-primary-brand text-xl mb-2">loyalty</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fidelidade</p>
              <p className="text-3xl font-black text-white mt-1">128</p>
              
              {/* Ícone de Loja flutuante à direita */}
              <div className="absolute -right-2 top-4 size-10 bg-white rounded-xl shadow-xl flex items-center justify-center border border-slate-100 transform translate-x-1/2">
                <span className="material-symbols-outlined text-slate-900 text-xl">storefront</span>
              </div>
           </div>
        </div>

        {/* Botão Criar Nova Campanha */}
        <button className="w-full bg-primary-brand h-16 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all">
           <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined font-black">add</span>
           </div>
           Criar Nova Campanha
        </button>

        {/* Seção de Promoções */}
        <section className="space-y-4">
          <h3 className="font-black text-xl px-1 text-slate-900">Suas Promoções</h3>
          
          <div className="space-y-4">
            {/* Promoção 1: Ativa */}
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-xl relative border border-white/5">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
               <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-white text-lg">Terça do Corte</h4>
                      <p className="text-xs text-slate-400 mt-1 font-medium">20% OFF em cortes masculinos.</p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 tracking-tighter">Ativa</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-5">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 
                      Expira 12 Ago
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">confirmation_number</span> 
                      12 usados
                    </span>
                  </div>
               </div>
            </div>

            {/* Promoção 2: Agendada */}
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-xl relative border border-white/5">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
               <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-white text-lg">Combo Pai & Filho</h4>
                      <p className="text-xs text-slate-400 mt-1 font-medium">Corte infantil grátis.</p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-500 tracking-tighter">Agendada</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-5">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 
                      Expira 12 Ago
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">confirmation_number</span> 
                      12 usados
                    </span>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerMarketing;
