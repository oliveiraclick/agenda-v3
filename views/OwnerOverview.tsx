
import React, { useState } from 'react';
import { OwnerView } from '../types';

interface OwnerOverviewProps {
  onNavigate: (view: OwnerView) => void;
}

const OwnerOverview: React.FC<OwnerOverviewProps> = ({ onNavigate }) => {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="min-h-screen bg-background-light text-slate-900 pb-24 view-transition">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center p-5 justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-cover rounded-full size-11 ring-2 ring-primary-brand/20 border-2 border-white shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/owner/200")' }}></div>
            <div><span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Gestor</span><h2 className="text-base font-bold text-slate-900">Jorge Silva</h2></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTips(true)} className="size-10 bg-rose-50 text-primary-brand rounded-full flex items-center justify-center border border-rose-100"><span className="material-symbols-outlined">lightbulb</span></button>
            <button className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600"><span className="material-symbols-outlined">notifications</span></button>
          </div>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-6 max-w-md mx-auto">
        {/* Menu Principal com Cards Vermelhos */}
        <div className="grid grid-cols-2 gap-4">
           {[ 
             { l: 'Financeiro', i: 'payments', v: 'financial' }, 
             { l: 'Estoque', i: 'inventory_2', v: 'inventory' }, 
             { l: 'Equipe', i: 'groups', v: 'team' }, 
             { l: 'Marketing', i: 'campaign', v: 'marketing' } 
           ].map((m, idx) => (
             <button key={idx} onClick={() => onNavigate(m.v as OwnerView)} className="bg-primary-brand p-5 rounded-3xl flex flex-col gap-3 active:scale-95 transition-all shadow-red-glow">
                <div className="bg-white/20 size-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">{m.i}</span>
                </div>
                <span className="text-sm font-bold text-white tracking-tight">{m.l}</span>
             </button>
           ))}
        </div>

        {/* Card de Faturamento em Destaque (Claro com Acentos) */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faturamento Mensal</p>
            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tighter text-slate-900">R$ 15.400,00</p>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-primary-brand rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-4 px-1 text-slate-900">Atividade Recente</h3>
          <div className="space-y-3">
             <button onClick={() => onNavigate('agenda')} className="w-full bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm hover:border-primary-brand transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-50 size-10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-brand">calendar_today</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-900">Agenda do Dia</p>
                    <p className="text-xs text-slate-400">8 agendamentos hoje</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary-brand group-hover:translate-x-1 transition-all">chevron_right</span>
             </button>
          </div>
        </section>
      </main>

      {showTips && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTips(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="bg-rose-100 size-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary-brand text-3xl">lightbulb</span>
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">Dica de Gestão</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">Seu serviço de "Barba" está com 30% mais procura às terças-feiras. Que tal criar uma oferta para esse período?</p>
            <button onClick={() => setShowTips(false)} className="w-full bg-primary-brand text-white py-4 rounded-2xl font-bold text-base shadow-red-glow">Entendido!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerOverview;