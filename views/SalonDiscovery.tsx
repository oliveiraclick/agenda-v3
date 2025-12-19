
import React from 'react';

interface SalonDiscoveryProps {
  onSelectSalon: () => void;
  onProfile: () => void;
}

const SalonDiscovery: React.FC<SalonDiscoveryProps> = ({ onSelectSalon, onProfile }) => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <button className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100"><span className="material-symbols-outlined">menu</span></button>
          <h2 className="font-bold text-lg flex-1 text-center">Explorar Serviços</h2>
          <button onClick={onProfile} className="size-10 rounded-full border border-slate-100 overflow-hidden">
             <img src="https://picsum.photos/seed/customer/100" className="w-full h-full object-cover" />
          </button>
        </div>
        <div className="relative mb-2">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
           <input className="w-full h-12 pl-12 rounded-xl bg-slate-50 border-none focus:ring-1 focus:ring-primary-brand text-sm" placeholder="O que você procura hoje?" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {['Todos', 'Estética', 'Bem-estar', 'Cabelo', 'Pet', 'Saúde'].map((cat, i) => (
            <button key={cat} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-primary-brand text-white shadow-red-glow' : 'bg-white text-slate-400 border border-slate-100'}`}>
               {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
         <h3 className="font-bold text-lg px-1 text-slate-900">Profissionais em Destaque</h3>
         {[
           { name: 'Clínica Estética Alpha', loc: 'São Paulo - SP', rate: '4.9', img: 'https://picsum.photos/seed/beauty/400/250' },
           { name: 'Dr. Ricardo - Fisio', loc: 'Campinas - SP', rate: '4.7', img: 'https://picsum.photos/seed/health/400/250' },
           { name: 'Studio Tattoo Art', loc: 'Curitiba - PR', rate: '5.0', img: 'https://picsum.photos/seed/tattoo/400/250' }
         ].map((shop, i) => (
           <article key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-card group">
              <div className="w-full h-40 rounded-xl overflow-hidden relative mb-3">
                 <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-500 text-sm material-symbols-filled">star</span>
                    <span className="text-[10px] font-bold text-slate-900">{shop.rate}</span>
                 </div>
                 <img src={shop.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex justify-between items-end">
                 <div>
                    <h4 className="font-bold text-base text-slate-900">{shop.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {shop.loc}</p>
                 </div>
                 <button onClick={onSelectSalon} className="bg-primary-brand text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-red-glow active:scale-95 transition-all">Agendar</button>
              </div>
           </article>
         ))}
      </main>
    </div>
  );
};

export default SalonDiscovery;
