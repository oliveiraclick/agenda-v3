
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { OwnerView } from '../types';

interface OwnerOverviewProps {
  onNavigate: (view: OwnerView) => void;
}

const OwnerOverview: React.FC<OwnerOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ revenue: 0, appointments: 0, customers: 0 });
  const [nextAppointments, setNextAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Buscar agendamentos de hoje para as métricas
      const today = new Date().toISOString().split('T')[0];

      // Usando client_name que já existe na tabela appointments para evitar erros de join com profiles
      const { data: apps, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (price, name)
        `)
        .eq('date', today);

      if (apps) {
        // @ts-ignore
        const rev = apps.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
        setStats({
          revenue: rev,
          appointments: apps.length,
          customers: new Set(apps.map(a => a.user_id)).size
        });
        setNextAppointments(apps.slice(0, 5));
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Header do Gestor */}
      <header className="p-6 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Dashboard</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gestão do Negócio</p>
          </div>
          <button onClick={() => onNavigate('settings')} className="size-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Cards de Métricas Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hoje</p>
            <p className="text-lg font-black text-emerald-400">R$ {stats.revenue.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Agend.</p>
            <p className="text-lg font-black">{stats.appointments}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Clientes</p>
            <p className="text-lg font-black text-blue-400">{stats.customers}</p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8 flex-1 overflow-y-auto">
        {/* Ações Rápidas */}
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('agenda')}
            className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-primary-brand/50 group"
          >
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight">Ver Agenda</span>
          </button>

          <button
            onClick={() => onNavigate('financial')}
            className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-emerald-500/50 group"
          >
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight">Financeiro</span>
          </button>
        </section>

        {/* Outras Seções */}
        <section>
          <h3 className="text-lg font-bold mb-4 px-1 text-slate-900">Gestão</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onNavigate('marketing')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Marketing</span>
            </button>

            <button onClick={() => onNavigate('team')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all">
              <div className="size-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Equipe</span>
            </button>

            <button onClick={() => onNavigate('inventory')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all">
              <div className="size-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Estoque</span>
            </button>
          </div>
        </section>

        {/* Próximos Agendamentos */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-900">Próximos</h3>
            <button onClick={() => onNavigate('agenda')} className="text-xs font-bold text-primary-brand">Ver todos</button>
          </div>

          <div className="space-y-3">
            {nextAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium bg-white rounded-[2rem] border border-slate-100 border-dashed">
                Sem agendamentos hoje
              </div>
            ) : (
              nextAppointments.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {app.time.substring(0, 5)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{app.client_name || 'Cliente'}</h4>
                    {/* @ts-ignore */}
                    <p className="text-xs text-slate-400 font-medium">{app.services?.name || 'Serviço'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerOverview;