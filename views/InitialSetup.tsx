
import React from 'react';

interface InitialSetupProps {
  onComplete: () => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="p-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-lg font-bold">Configuração Inicial</h2>
        <button onClick={onComplete} className="text-primary-brand font-bold text-sm">Salvar</button>
      </header>

      <div className="px-4 py-4 bg-rose-50 border-b border-rose-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-primary-brand">Progresso do Setup</h3>
          <span className="text-xs font-bold text-primary-brand">50% Completo</span>
        </div>
        <div className="h-2 w-full bg-white rounded-full overflow-hidden">
          <div className="h-full bg-primary-brand" style={{ width: '50%' }}></div>
        </div>
      </div>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="size-6 bg-primary-brand text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-bold text-base">Dados do Negócio</h3>
           </div>
           <div className="bg-white p-4 rounded-2xl border-2 border-rose-100 shadow-card">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Nome do Negócio</span>
                  <input type="text" className="w-full h-12 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-primary-brand" placeholder="Ex: Studio VIP ou Seu Nome" />
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white transition-colors">
                  <div className="size-8 bg-rose-100 text-primary-brand rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">schedule</span></div>
                  <div className="flex-1"><p className="text-sm font-bold">Definir Horários</p></div>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-4 opacity-70">
           <div className="flex items-center gap-2">
              <div className="size-6 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="font-bold text-base">Cadastrar Serviços</h3>
           </div>
           <button className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:border-primary-brand hover:text-primary-brand transition-colors">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
              <span className="text-sm font-bold">Adicionar pelo menos um serviço</span>
           </button>
        </div>
      </main>

      <div className="p-4 bg-white border-t border-slate-100">
        <button 
          onClick={onComplete}
          className="w-full bg-primary-brand py-5 rounded-2xl text-white font-bold shadow-red-glow flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Finalizar Configuração <span className="material-symbols-outlined">check</span>
        </button>
      </div>
    </div>
  );
};

export default InitialSetup;
