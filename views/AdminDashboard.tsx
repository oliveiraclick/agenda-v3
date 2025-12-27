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
import AdminStatsFilter from '../components/admin/AdminStatsFilter';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import AdminSettings from '../components/admin/AdminSettings';
import AdminPromoCodes from '../components/admin/AdminPromoCodes';

interface AdminDashboardProps {
   currentView: AdminView;
   onNavigate: (view: AdminView) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentView, onNavigate }) => {
   const [stats, setStats] = useState({
      activeSaloons: 0,
      totalUsers: 0,
      totalProfessionals: 0,
      appointmentsCount: 0,
      mrr: 0
   });

   // Stats Filter State
   const [selectedRange, setSelectedRange] = useState('today');
   const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
   const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

   useEffect(() => {
      loadStats();
   }, [selectedRange, customStartDate, customEndDate]);

   const loadStats = async () => {
      // 1. Basic Counts (Salons & Users)
      const { count: saloonsCount } = await supabase
         .from('establishments')
         .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .eq('role', 'customer');

      // 2. Total Professionals
      const { count: professionalsCount } = await supabase
         .from('profiles')
         .select('*', { count: 'exact', head: true })
         .eq('role', 'professional');

      // 3. Appointments Count (Filtered)
      let query = supabase.from('appointments').select('*', { count: 'exact', head: true });

      const now = new Date();
      let startDate = new Date();

      if (selectedRange === 'today') {
         startDate.setHours(0, 0, 0, 0);
      } else if (selectedRange === '7d') {
         startDate.setDate(now.getDate() - 7);
      } else if (selectedRange === '15d') {
         startDate.setDate(now.getDate() - 15);
      } else if (selectedRange === '30d') {
         startDate.setDate(now.getDate() - 30);
      } else if (selectedRange === 'custom') {
         startDate = new Date(customStartDate);
         const endDate = new Date(customEndDate);
         endDate.setHours(23, 59, 59, 999);
         query = query.lte('created_at', endDate.toISOString());
      }

      if (selectedRange !== 'custom') {
         query = query.gte('created_at', startDate.toISOString());
      } else {
         query = query.gte('created_at', startDate.toISOString());
      }

      const { count: appointmentsCount } = await query;

      setStats({
         activeSaloons: saloonsCount || 0,
         totalUsers: usersCount || 0,
         totalProfessionals: professionalsCount || 0,
         appointmentsCount: appointmentsCount || 0,
         mrr: (saloonsCount || 0) * 97 // MRR Simulado base R$97/salão
      });
   };

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
                     {currentView === 'salons' && 'Gerenciar Clientes'}
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

                  {/* Stats Filter */}
                  <AdminStatsFilter
                     selectedRange={selectedRange}
                     onRangeChange={setSelectedRange}
                     customStartDate={customStartDate}
                     customEndDate={customEndDate}
                     onCustomDateChange={(s, e) => { setCustomStartDate(s); setCustomEndDate(e); }}
                  />

                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <span className="material-symbols-outlined">storefront</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes Ativos</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.activeSaloons}</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                              <span className="material-symbols-outlined">group</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profissionais</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.totalProfessionals}</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                              <span className="material-symbols-outlined">event</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agendamentos</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.appointmentsCount}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                           {selectedRange === 'today' ? 'Hoje' : selectedRange === 'custom' ? 'Período Selecionado' : `Últimos ${selectedRange}`}
                        </p>
                     </div>
                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                              <span className="material-symbols-outlined">payments</span>
                           </div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Estimado</span>
                        </div>
                        <p className="text-3xl font-black">R$ {stats.mrr.toLocaleString('pt-BR')}</p>
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

            {/* Users View */}
            {currentView === 'users' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AdminUsersTable />
               </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AdminSettings />
               </div>
            )}

            {/* Promo Codes View */}
            {currentView === 'promocodes' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AdminPromoCodes />
               </div>
            )}
         </main>
      </div>
   );
};

export default AdminDashboard;
