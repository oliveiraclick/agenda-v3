
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CustomerHistoryProps {
  onBack: () => void;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'futuros' | 'passados'>('futuros');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          professionals (name, image)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Atualiza a lista localmente
      setAppointments(appointments.map(app =>
        app.id === id ? { ...app, status: 'cancelled' } : app
      ));
      alert("Agendamento cancelado.");
    } catch (err: any) {
      alert("Erro ao cancelar: " + err.message);
    }
  };

  const now = new Date();
  const future = appointments.filter(a => {
    // Se não tiver data/hora válida, ignora
    if (!a.date || !a.time) return false;
    const appDate = new Date(`${a.date}T${a.time}`);
    return appDate >= now && a.status !== 'cancelled';
  });

  const past = appointments.filter(a => {
    if (!a.date || !a.time) return true; // Se data inválida, joga pro histórico por segurança
    const appDate = new Date(`${a.date}T${a.time}`);
    return appDate < now || a.status === 'cancelled';
  });

  const displayList = tab === 'futuros' ? future : past;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <header className="p-6 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h2 className="text-xl font-black tracking-tighter">Meus Agendamentos</h2>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setTab('futuros')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'futuros' ? 'bg-white shadow-sm text-primary-brand' : 'text-slate-500'}`}
          >
            Próximos
          </button>
          <button
            onClick={() => setTab('passados')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'passados' ? 'bg-white shadow-sm text-primary-brand' : 'text-slate-500'}`}
          >
            Histórico
          </button>
        </div>
      </header>

      <main className="p-6 flex-1 pb-24">
        {loading ? (
          <div className="text-center py-10 font-bold text-slate-400">Carregando...</div>
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">calendar_today</span>
            <p className="font-bold text-slate-500 text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayList.map((app) => (
              <div key={app.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                      app.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {app.status === 'confirmed' ? 'Confirmado' : app.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="size-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    {/* @ts-ignore */}
                    <img src={app.professionals?.image || 'https://picsum.photos/seed/barber/200'} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    {/* @ts-ignore */}
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{app.services?.name || 'Serviço'}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time?.substring(0, 5)}
                    </p>
                    {/* @ts-ignore */}
                    <p className="text-xs font-medium text-slate-400 mt-0.5">com {app.professionals?.name}</p>
                  </div>
                </div>

                {tab === 'futuros' && app.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex gap-3">
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="flex-1 py-3 rounded-xl border border-red-100 text-red-500 font-bold text-xs hover:bg-red-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button className="flex-1 py-3 rounded-xl bg-primary-brand text-white font-bold text-xs shadow-red-glow">
                      Ver Detalhes
                    </button>
                  </div>
                )}

                {tab === 'passados' && app.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs">
                      Avaliar Experiência
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerHistory;
