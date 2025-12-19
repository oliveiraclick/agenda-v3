
import React from 'react';

interface CustomerFavoritesProps {
  onBack: () => void;
}

const CustomerFavorites: React.FC<CustomerFavoritesProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col pb-32 max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 flex items-center border-b dark:border-slate-800">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="flex-1 text-center font-bold text-lg pr-10">Meus Favoritos</h2>
      </header>

      <main className="p-4 space-y-6 overflow-y-auto">
        <div className="relative"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span><input className="w-full h-12 pl-12 rounded-xl bg-white dark:bg-[#232f48] border-none focus:ring-1 focus:ring-primary text-sm" placeholder="Buscar por nome ou serviço..." /></div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {['Todos', 'Cabelo', 'Barba', 'Manicure'].map(cat => (
             <button key={cat} className="px-5 py-2.5 rounded-full bg-white dark:bg-[#232f48] text-xs font-bold border dark:border-white/5">{cat}</button>
           ))}
        </div>

        <div className="space-y-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white dark:bg-[#192233] p-4 rounded-2xl shadow-sm border dark:border-white/5 space-y-4">
                <div className="flex gap-4">
                   <div className="size-20 bg-cover rounded-xl" style={{ backgroundImage: `url("https://picsum.photos/seed/fav${i}/200")` }} />
                   <div className="flex-1">
                      <div className="flex justify-between items-start"><div><h3 className="font-bold">Barbearia do João</h3><p className="text-[10px] text-gray-500 mt-1">Av. Paulista, 1000 - Centro</p></div><span className="material-symbols-outlined text-red-500 material-symbols-filled">favorite</span></div>
                      <div className="flex items-center gap-2 mt-2"><div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded text-yellow-500"><span className="material-symbols-outlined text-[10px] material-symbols-filled">star</span><span className="text-[10px] font-bold">4.8</span></div><span className="text-[10px] text-gray-500">(120 avaliações)</span></div>
                   </div>
                </div>
                <div className="flex gap-3 pt-4 border-t dark:border-white/5">
                   <button className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-[#232f48] text-xs font-bold">Ver Perfil</button>
                   <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">Agendar</button>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default CustomerFavorites;
