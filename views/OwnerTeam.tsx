
import React from 'react';
import { MOCK_PROFESSIONALS } from '../constants';

interface OwnerTeamProps {
  onBack: () => void;
}

const OwnerTeam: React.FC<OwnerTeamProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Minha Equipe</h1>
        <button className="size-10 bg-primary-owner text-white rounded-full flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">add</span></button>
      </header>

      <main className="p-4 space-y-5 pb-24 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#1a2230] p-4 rounded-2xl border dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-start mb-1">
                <span className="text-2xl font-bold">5</span>
                <span className="material-symbols-outlined text-primary-owner bg-primary-owner/10 p-1 rounded">group</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Ativos</p>
          </div>
          <div className="bg-white dark:bg-[#1a2230] p-4 rounded-2xl border dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-start mb-1">
                <span className="text-2xl font-bold">4.8</span>
                <span className="material-symbols-outlined text-yellow-500 bg-yellow-500/10 p-1 rounded">star</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Média</p>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_PROFESSIONALS.map(pro => (
            <div key={pro.id} className="bg-white dark:bg-[#1a2230] p-4 rounded-2xl border dark:border-slate-800 shadow-sm group">
              <div className="flex items-center gap-4 mb-4">
                 <div className="relative">
                    <img src={pro.image} className="size-14 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                    <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-dark"></div>
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-base">{pro.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{pro.role}</p>
                 </div>
                 <button className="text-slate-400"><span className="material-symbols-outlined">more_vert</span></button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#151b26] p-3 rounded-xl border dark:border-slate-800/50">
                <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Serviços</p>
                   <p className="font-bold text-primary-owner">40%</p>
                </div>
                <div className="border-l dark:border-slate-700 pl-3">
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Produtos</p>
                   <p className="font-bold text-slate-600 dark:text-slate-300">15%</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="bg-primary-owner/10 text-primary-owner text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 group-hover:bg-primary-owner group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  Link da Agenda
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OwnerTeam;
