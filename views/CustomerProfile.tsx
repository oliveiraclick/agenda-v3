
import React from 'react';

interface CustomerProfileProps {
  onBack: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col pb-32 max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 flex items-center justify-between border-b dark:border-slate-800">
        <button onClick={onBack} className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
        <h2 className="font-bold text-lg">Meu Perfil</h2>
        <button className="text-primary font-bold">Editar</button>
      </header>

      <main className="p-6 space-y-8 overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
           <div className="relative">
              <div className="size-28 rounded-full bg-cover shadow-xl ring-4 ring-slate-100 dark:ring-surface-dark" style={{ backgroundImage: 'url("https://picsum.photos/seed/profile/200")' }}></div>
              <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-background-dark"><span className="material-symbols-outlined text-[18px]">photo_camera</span></div>
           </div>
           <div className="text-center"><h1 className="text-2xl font-bold">Ana Silva</h1><p className="text-sm text-gray-500">Cliente desde 2023</p></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {[ { i: 'favorite', l: 'Favoritos', c: 'text-red-500' }, { i: 'history', l: 'Histórico', c: 'text-primary' }, { i: 'card_membership', l: 'Fidelidade', c: 'text-amber-500' } ].map((btn, idx) => (
             <button key={idx} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border dark:border-slate-800 active:scale-95 transition-all">
                <div className={`p-3 rounded-full bg-slate-50 dark:bg-slate-800 ${btn.c}`}><span className="material-symbols-outlined">{btn.i}</span></div>
                <span className="text-[10px] font-bold">{btn.l}</span>
             </button>
           ))}
        </div>

        <section className="space-y-4">
           <h3 className="font-bold text-lg px-1">Informações Pessoais</h3>
           <div className="bg-white dark:bg-surface-dark rounded-2xl border dark:border-slate-800 overflow-hidden divide-y dark:divide-slate-800">
              <div className="p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4"><span className="material-symbols-outlined text-gray-400">person</span><div><p className="text-[10px] uppercase font-bold text-gray-400">Nome</p><p className="font-medium">Ana Silva</p></div></div>
                 <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4"><span className="material-symbols-outlined text-gray-400">mail</span><div><p className="text-[10px] uppercase font-bold text-gray-400">E-mail</p><p className="font-medium">ana.silva@email.com</p></div></div>
                 <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
           </div>
        </section>

        <section className="space-y-4">
           <h3 className="font-bold text-lg px-1">Configurações</h3>
           <div className="bg-white dark:bg-surface-dark rounded-2xl border dark:border-slate-800 overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4"><span className="material-symbols-outlined text-gray-400">notifications</span><p className="font-medium">Notificações</p></div>
                 <div className="w-11 h-6 bg-primary rounded-full relative p-0.5"><div className="size-5 bg-white rounded-full ml-auto shadow-sm" /></div>
              </div>
              <button className="w-full p-4 flex items-center gap-4 text-red-500 border-t dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                 <span className="material-symbols-outlined">logout</span><span className="font-medium">Sair da conta</span>
              </button>
           </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerProfile;
