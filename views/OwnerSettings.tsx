
import React from 'react';

interface OwnerSettingsProps {
  onBack: () => void;
}

const OwnerSettings: React.FC<OwnerSettingsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md flex items-center p-4 justify-between border-b border-slate-100">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Configurações</h2>
        <button className="text-primary-brand font-bold text-sm">Salvar</button>
      </header>

      <main className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        <section className="px-4 py-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Dados do Negócio</h3>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium mb-1 block text-slate-500">Nome da Empresa / Profissional</span>
              <input 
                type="text" 
                defaultValue="Estúdio Alpha"
                className="w-full h-12 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-base px-4"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block text-slate-500">Endereço</span>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Av. Paulista, 1000 - SP"
                  className="w-full h-12 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-base px-4 pr-12"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
              </div>
            </label>
          </div>
        </section>

        <section className="px-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Personalização</h3>
          <div className="relative w-full h-40 rounded-2xl overflow-hidden group cursor-pointer border-2 border-dashed border-slate-200 hover:border-primary-brand transition-colors">
            <img 
              src="https://picsum.photos/seed/business/800/400" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-black/50 p-2 rounded-full mb-1"><span className="material-symbols-outlined text-white">add_a_photo</span></div>
              <span className="text-white text-xs font-bold drop-shadow-md">Alterar Capa</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Descrição</span>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary-brand bg-rose-50 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Melhorar com IA
              </button>
            </div>
            <textarea 
              className="w-full h-32 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-sm p-4 resize-none"
              placeholder="Descreva seu negócio e especialidades..."
            />
          </div>
        </section>

        <section className="px-4 space-y-4 pb-10">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Serviços Oferecidos</h3>
              <button className="text-primary-brand text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">add</span> Novo</button>
           </div>
           <div className="space-y-3">
              {[
                { name: 'Serviço Premium', price: '45,00', time: '45 min' },
                { name: 'Manutenção', price: '35,00', time: '30 min' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">R$ {s.price} • {s.time}</p>
                  </div>
                  <button className="text-slate-400"><span className="material-symbols-outlined">edit</span></button>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerSettings;
