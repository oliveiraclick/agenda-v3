
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseCurrency } from '../lib/currency';

interface OwnerFinancialProps {
  onBack: () => void;
}

const OwnerFinancial: React.FC<OwnerFinancialProps> = ({ onBack }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: 0, type: 'fixed' });

  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get Establishment
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (est) {
      setEstablishmentId(est.id);

      // 2. Fetch Data for this establishment
      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('establishment_id', est.id)
        .eq('status', 'confirmed');
      if (appts) setAppointments(appts);

      const { data: exps } = await supabase
        .from('expenses')
        .select('*')
        .eq('establishment_id', est.id)
        .order('date', { ascending: false });
      if (exps) setExpenses(exps);
    }
    setLoading(false);
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return alert('Preencha título e valor');
    if (!establishmentId) return alert('Estabelecimento não encontrado.');

    const { error } = await supabase.from('expenses').insert([
      {
        title: newExpense.title,
        amount: newExpense.amount,
        type: newExpense.type,
        establishment_id: establishmentId
      }
    ]);

    if (error) {
      alert('Erro ao adicionar despesa');
    } else {
      setShowModal(false);
      setNewExpense({ title: '', amount: 0, type: 'fixed' });
      fetchFinancialData();
    }
  };

  // Calculations
  const totalRevenue = appointments.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const balance = totalRevenue - totalExpenses;

  // Chart Data
  const getChartData = () => {
    const days = 7;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayRevenue = appointments
        .filter(a => a.date === dateStr)
        .reduce((acc, curr) => acc + (curr.price || 0), 0);

      data.push({ day: d.getDate(), value: dayRevenue });
    }
    return data;
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map(d => d.value), 100); // Default scale 100 if empty

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col max-w-md mx-auto relative view-transition">
      <header className="flex items-center justify-between p-4 pt-6 pb-2 bg-background-light dark:bg-[#111722] sticky top-0 z-20">
        <button onClick={onBack} className="size-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Financeiro</h2>
        <button className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">settings</span></button>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary-owner p-6 shadow-lg shadow-primary-owner/20">
            <p className="text-blue-100 text-sm font-medium mb-1">Saldo Total</p>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">R$ {balance.toFixed(2)}</h1>

            {/* Simple SVG Chart */}
            <div className="mt-6 h-16 flex items-end gap-2">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-white/20 rounded-t-sm transition-all group-hover:bg-white/40"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                  ></div>
                  <span className="text-[8px] text-white/60">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl border dark:border-slate-800">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Entradas</p>
              <p className="text-emerald-500 text-xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-[#232f48] p-4 rounded-2xl border dark:border-slate-800">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Saídas</p>
              <p className="text-red-500 text-xl font-bold">-R$ {totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-lg px-2">Extrato</h3>
            {loading ? <p className="text-center text-slate-400">Carregando...</p> : (
              [...appointments.map(a => ({ ...a, type: 'in' })), ...expenses.map(e => ({ ...e, type: 'out' }))]
                .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
                .slice(0, 10) // Show last 10
                .map((item, i) => (
                  <div key={i} className="bg-white dark:bg-[#232f48] p-4 rounded-xl flex items-center justify-between border dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center ${item.type === 'in' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                        <span className="material-symbols-outlined">{item.type === 'in' ? 'payments' : 'receipt_long'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.title || item.service_name || 'Serviço'}</p>
                        <p className="text-xs text-slate-400">{item.type === 'in' ? (item.client_name || 'Cliente') : 'Despesa'}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${item.type === 'in' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {item.type === 'in' ? '+' : '-'} R$ {(item.amount || item.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-20">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 h-14 pr-6 pl-4 rounded-full bg-primary-owner text-white shadow-xl shadow-primary-owner/40 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
          <span className="font-bold">Lançamento</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-lg font-bold mb-4">Nova Despesa</h2>
            <div className="space-y-4">
              <input
                placeholder="Título (ex: Conta de Luz)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                value={newExpense.title}
                onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
              />
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-500">Valor (R$)</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-right font-bold border-none outline-none ring-0 focus:ring-0 placeholder:text-slate-300"
                  placeholder="0,00"
                  value={formatCurrency(newExpense.amount.toFixed(2).replace('.', ''))}
                  onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                  onClick={(e) => {
                    const len = e.currentTarget.value.length;
                    e.currentTarget.setSelectionRange(len, len);
                  }}
                  onChange={e => {
                    const val = parseCurrency(e.target.value);
                    setNewExpense({ ...newExpense, amount: val });
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewExpense({ ...newExpense, type: 'fixed' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newExpense.type === 'fixed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  Fixa
                </button>
                <button
                  onClick={() => setNewExpense({ ...newExpense, type: 'variable' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newExpense.type === 'variable' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                >
                  Variável
                </button>
              </div>
              <button onClick={handleAddExpense} className="w-full bg-primary-owner text-white font-bold py-4 rounded-2xl shadow-red-glow active:scale-95 transition-all">
                Salvar Despesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerFinancial;
