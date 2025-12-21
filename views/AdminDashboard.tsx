import React, { useState, useEffect } from 'react';
import { AdminView } from '../types';
import { supabase } from '../lib/supabase';
import AdminSidebar from '../components/admin/AdminSidebar';
import SalonsTable from '../components/admin/SalonsTable';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import AdminActivityFeed from '../components/admin/AdminActivityFeed';
import AdminTopSalons from '../components/admin/AdminTopSalons';
import AdminFeedback from '../components/admin/AdminFeedback';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminRevenue from '../components/admin/AdminRevenue';

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
            mrr: (saloonsCount || 0) * 97 // MRR Simulado base R$97/salão
         });
      };
      loadStats();
   }, []);

   const handleLogout = async () => {
      await supabase.auth.signOut();
      // App.tsx listener will handle redirect
   };

   return (
      <div className="min-h-screen bg-slate-50 flex">
         <AdminSidebar currentView={currentView} onNavigate={onNavigate} onLogout={handleLogout} />

         <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
               <div>
                  <h2 className="text-2xl font-black text-slate-900">
                     {currentView === 'dashboard' && 'Visão Geral'}
                     {currentView === 'salons' && 'Gerenciar Salões'}
                     {currentView === 'users' && 'Usuários'}
                     {currentView === 'settings' && 'Configurações'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Bem-vindo de volta, Chefe.</p>
               </div>
               <div className="flex items-center gap-4">
                  <button className="size-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-primary-brand transition-colors">
                     <span className="material-symbols-outlined">notifications</span>
                  </button>
                  <div className="size-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                     SA
                  </div>
               </div>
            </header>

            {/* Dashboard View */}
            {currentView === 'dashboard' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <span className="material-symbols-outlined">storefront</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salões Ativos</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900">{stats.activeSaloons}</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                              <span className="material-symbols-outlined">group</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuários Totais</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900">{stats.totalUsers}</p>
                     </div>
                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                              <span className="material-symbols-outlined">payments</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Estimado</span>
                        </div>
                        <p className="text-4xl font-black">R$ {stats.mrr.toLocaleString('pt-BR')}</p>
                     </div>
                  </div>

                  {/* Main Charts Area */}
                  <AnalyticsCharts />

                  {/* Secondary Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 space-y-6">
                        <AdminActivityFeed />
                        <SalonsTable />
                     </div>
                     <div className="space-y-6">
                        <AdminNotifications />
                        <AdminRevenue />
                        <AdminTopSalons />
                        <AdminFeedback />
                     </div>
                  </div>
               </div>
            )}

            {/* Salons View */}
            {currentView === 'salons' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SalonsTable />
               </div>
            )}

            {/* Users View (Placeholder) */}
            {currentView === 'users' && (
               <div className="bg-white p-10 rounded-3xl text-center border border-slate-100">
                  <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">engineering</span>
                  <h3 className="text-xl font-bold text-slate-900">Em Desenvolvimento</h3>
                  <p className="text-slate-500">A gestão de usuários estará disponível em breve.</p>
               </div>
            )}
         </main>
      </div>
   );
};

export default AdminDashboard;
