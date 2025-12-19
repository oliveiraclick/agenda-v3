
import React, { useState, useEffect } from 'react';
import { AdminView } from '../types';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
   currentView: AdminView;
   onNavigate: (view: AdminView) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentView, onNavigate }) => {
   const [stats, setStats] = useState({ activeSaloons: 0, totalUsers: 0, mrr: 0 });

   useEffect(() => {
      const loadStats = async () => {
         // Conta Salões (Establishments)
         const { count: saloonsCount } = await supabase
            .from('establishments')
            .select('*', { count: 'exact', head: true });

         // Conta Usuários (Profiles)
         const { count: usersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

         setStats({
            activeSaloons: saloonsCount || 0,
            totalUsers: usersCount || 0,
            mrr: 125400 // Mockado
         });
      };
      loadStats();
   }, []);

   return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto pb-24">
         <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 border-b dark:border-slate-800">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full border-2 border-primary ring-4 ring-primary/10 bg-cover" style={{ backgroundImage: 'url("https://picsum.photos/seed/admin/100")' }}></div>
                  <div><p className="text-[10px] font-bold text-slate-400">Bem-vindo</p><h1 className="font-bold">Admin</h1></div>
               </div>
               <button className="size-10 bg-white dark:bg-[#232f48] rounded-full flex items-center justify-center shadow-sm relative"><span className="material-symbols-outlined">notifications</span><span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" /></button>
            </div>
         </header>

         <main className="p-4 space-y-6 overflow-y-auto flex-1">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
               {['Hoje', '7 Dias', 'Este Mês'].map((f, i) => (
                  <button key={f} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-[#232f48] text-slate-400'}`}>{f}</button>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl shadow-sm border dark:border-slate-800">
                  <span className="material-symbols-outlined text-primary text-xl mb-1">storefront</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Salões Ativos</p>
                  <p className="text-2xl font-bold mt-1">{stats.activeSaloons}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1">+5% vs mês ant.</p>
               </div>
               <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl shadow-sm border dark:border-slate-800">
                  <span className="material-symbols-outlined text-purple-500 text-xl mb-1">group</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Usuários</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1">+1.2%</p>
               </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-600 p-5 rounded-2xl text-white shadow-xl shadow-primary/20">
               <div className="flex justify-between items-start mb-2">
                  <div><p className="text-blue-100 text-xs font-bold uppercase mb-1">Faturamento (MRR)</p><p className="text-3xl font-extrabold">R$ 125.400</p></div>
                  <div className="bg-white/20 p-2 rounded-xl"><span className="material-symbols-outlined">payments</span></div>
               </div>
               <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-max px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> 8%
               </div>
            </div>

            <section className="space-y-4">
               <h3 className="font-bold text-lg px-1">Alertas Recentes</h3>
               <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border dark:border-amber-900/30 flex gap-3">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  <div className="flex-1"><p className="text-sm font-bold">Pagamento Pendente</p><p className="text-xs text-slate-500 mt-1">Salão Belleza Pura não processou o pagamento.</p></div>
                  <button className="bg-white dark:bg-[#232f48] px-3 py-1 rounded-lg text-[10px] font-bold border dark:border-slate-700 shadow-sm">Ver</button>
               </div>
            </section>
         </main>
      </div>
   );
};

export default AdminDashboard;
