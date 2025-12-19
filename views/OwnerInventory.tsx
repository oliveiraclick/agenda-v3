
import React from 'react';

interface OwnerInventoryProps {
  onBack: () => void;
}

const OwnerInventory: React.FC<OwnerInventoryProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Estoque</h2>
          <button className="size-10 bg-primary-owner text-white rounded-full flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">add</span></button>
        </div>
        <div className="flex w-full items-center rounded-xl bg-white dark:bg-[#1a2332] shadow-sm border dark:border-slate-800 h-12 px-4 focus-within:ring-1 focus-within:ring-primary-owner">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder="Buscar produto..." />
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24 overflow-y-auto">
        {[
          { name: 'Shampoo Premium', brand: "L'Oreal", stock: 12, cost: 25, price: 55, status: 'normal' },
          { name: 'Cera Matte', brand: "Barba Forte", stock: 4, cost: 15, price: 35, status: 'low' },
          { name: 'Gel Limpeza', brand: "DermoCare", stock: 1, cost: 32, price: 78, status: 'critical' }
        ].map((p, i) => (
          <article key={i} className="bg-white dark:bg-[#1a2332] p-4 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col gap-3">
             <div className="flex gap-4">
                <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                   <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-sm leading-tight">{p.name}</h3>
                   <p className="text-xs text-slate-500">{p.brand}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'critical' ? 'bg-red-500/10 text-red-500' : p.status === 'low' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                         {p.stock} un
                      </span>
                      <span className="text-[10px] text-slate-400">em estoque</span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3 pt-3 border-t dark:border-slate-800/50">
                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Custo</p>
                   <p className="font-bold text-sm">R$ {p.cost.toFixed(2)}</p>
                </div>
                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Venda</p>
                   <p className="font-bold text-sm text-primary-owner">R$ {p.price.toFixed(2)}</p>
                </div>
             </div>
          </article>
        ))}
      </main>
    </div>
  );
};

export default OwnerInventory;
