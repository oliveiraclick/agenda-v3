
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

  // Trial Logic
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Establishment Creation Logic
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEstName, setNewEstName] = useState('');

  useEffect(() => {
    checkAndFetchData();
  }, []);

  const checkAndFetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Check if establishment exists and get Trial Data
      const { data: est } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!est) {
        // Not found? Show modal to create explicitly
        setShowCreateModal(true);
        setLoading(false);
        return;
      }

      // 2. Trial Logic (if est exists)
      if (est.trial_ends_at) {
        const end = new Date(est.trial_ends_at);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(diff > 0 ? diff : 0);

        // Show modal if strictly in trial (simple logic: active trial)
        const seen = localStorage.getItem('seen_pricing_v3');
        if (!seen && diff > 0) {
          setShowTrialModal(true);
        }
      }

      // 3. Fetch dashboard data
      const today = new Date().toISOString().split('T')[0];
      const { data: apps } = await supabase
        .from('appointments')
        .select(`*, services (price, name)`)
        .eq('date', today)
        .eq('establishment_id', est.id);

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
      if (!showCreateModal) setLoading(false);
    }
  };

  const handleCloseModal = () => {
    localStorage.setItem('seen_pricing_v3', 'true');
    setShowTrialModal(false);
  };

  const handleCreateEstablishment = async () => {
    if (!newEstName.trim()) return alert('Digite o nome do seu negócio.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create with 30 days trial by default as well
    const trialDays = 30;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    const { error } = await supabase.from('establishments').insert({
      owner_id: user.id,
      name: newEstName,
      slug: (newEstName.toLowerCase().replace(/\s+/g, '-') + '-' + user.id.slice(0, 4)),
      trial_ends_at: trialEndDate.toISOString(),
      subscription_plan: 'trial'
    });

    if (error) {
      alert('Erro ao criar estabelecimento: ' + error.message);
    } else {
      setShowCreateModal(false);
      checkAndFetchData(); // Reload
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto pb-24 view-transition">
      {/* Header do Gestor */}
      <header className="p-6 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        {/* Trial Banner inside Header */}
        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-orange-400 to-rose-500 py-1 px-4 text-center shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">timer</span>
              Testando: {daysRemaining} dias restantes
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8 mt-6">
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
            <button onClick={() => onNavigate('services')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all">
              <div className="size-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <span className="material-symbols-outlined">category</span>
              </div>
              <span className="text-xs font-bold text-slate-700">Serviços</span>
            </button>

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

      {/* MODAL DE EXPLICAÇÃO DA COBRANÇA */}
      {showTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-2 leading-tight">Você ganhou<br />30 dias grátis!</h2>
            <p className="text-center text-slate-500 font-medium mb-6">
              Aproveite todas as funcionalidades sem compromisso.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Após o período de teste:</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Plano Base (Sistema)</span>
                <span className="font-bold text-slate-900">R$ 29,90</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Por Profissional</span>
                <span className="font-bold text-slate-900">+ R$ 10,00</span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2">
                <p className="text-[10px] text-slate-400 leading-tight">
                  *Cobrança mensal automática somente após o fim do teste. Cancele quando quiser.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-primary-brand py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-primary-brand/30 active:scale-95 transition-all"
            >
              Começar Agora
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO OBRIGATÓRIA DO ESTABELECIMENTO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="size-20 rounded-full bg-primary-owner/10 flex items-center justify-center mx-auto mb-6 text-primary-owner">
              <span className="material-symbols-outlined text-4xl">storefront</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Bem-vindo(a)!</h2>
            <p className="text-slate-500 text-center mb-8">Para começar, qual é o nome do seu negócio?</p>

            <div className="space-y-4">
              <input
                autoFocus
                placeholder="Ex: Barbearia do Mestre"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:border-primary-owner focus:ring-4 focus:ring-primary-owner/10 transition-all"
                value={newEstName}
                onChange={e => setNewEstName(e.target.value)}
              />
              <button
                onClick={handleCreateEstablishment}
                disabled={!newEstName.trim()}
                className="w-full h-16 bg-primary-owner text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-owner/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
              >
                Criar Meu Negócio
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default OwnerOverview;