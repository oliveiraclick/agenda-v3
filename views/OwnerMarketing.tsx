
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface OwnerMarketingProps {
  onBack: () => void;
}

const OwnerMarketing: React.FC<OwnerMarketingProps> = ({ onBack }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '', discount_percent: 10, end_date: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data);
    setLoading(false);
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.discount_percent) return alert('Preencha nome e desconto');

    const { error } = await supabase.from('campaigns').insert([
      {
        name: newCampaign.name,
        description: newCampaign.description,
        discount_percent: newCampaign.discount_percent,
        end_date: newCampaign.end_date || null,
        status: 'active'
      }
    ]);

    if (error) {
      alert('Erro ao criar campanha');
    } else {
      setShowModal(false);
      setNewCampaign({ name: '', description: '', discount_percent: 10, end_date: '' });
      fetchCampaigns();
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition relative">
      {/* Header Escuro com Curva Suave */}
      <header className="bg-[#111722] p-6 pt-12 pb-24 rounded-b-[3rem] relative shadow-2xl z-0">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black text-white tracking-tight">Marketing</h2>
          </div>
          <button className="px-4 py-2 rounded-full bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 transition-all">
            Ajuda
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </header>

      <main className="flex-1 -mt-16 px-5 pb-32 overflow-y-auto no-scrollbar space-y-8 relative z-10">
        {/* Métricas Principais */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <span className="material-symbols-outlined text-primary-brand text-2xl mb-3 relative">campaign</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative">Campanhas</p>
            <p className="text-3xl font-black text-slate-900 mt-1 relative">{activeCampaigns.length}</p>
          </div>

          <div className="flex-1 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <span className="material-symbols-outlined text-emerald-500 text-2xl mb-3 relative">loyalty</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative">Fidelidade</p>
            <p className="text-3xl font-black text-slate-900 mt-1 relative">128</p>
          </div>
        </div>

        {/* Botão Criar Nova Campanha */}
        <button onClick={() => setShowModal(true)} className="w-full bg-primary-brand h-16 rounded-2xl text-white font-black flex items-center justify-center gap-3 shadow-red-glow hover:scale-[1.02] active:scale-95 transition-all group">
          <div className="size-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined font-black">add</span>
          </div>
          Criar Nova Campanha
        </button>

        {/* Seção de Promoções */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-xl text-slate-900">Suas Promoções</h3>
            <span className="text-xs font-bold text-slate-400">{campaigns.length} total</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <span className="material-symbols-outlined text-3xl mb-2 animate-spin">sync</span>
                <p className="text-xs font-bold">Carregando...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-10 opacity-50 bg-white rounded-3xl border border-slate-100 border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">campaign</span>
                <p className="text-sm font-bold text-slate-400">Nenhuma campanha ativa</p>
              </div>
            ) : campaigns.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${c.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

                <div className="flex justify-between items-start mb-3 pl-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{c.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{c.description || `${c.discount_percent}% de desconto`}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wide ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {c.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="flex items-center gap-4 pl-3 mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span className="text-[10px] font-bold">{c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Sem validade'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                    <span className="text-[10px] font-bold">{c.usage_count || 0} usados</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 ring-4 ring-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Nova Campanha</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">Crie promoções para seus clientes</p>
              </div>
              <button onClick={() => setShowModal(false)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div className="group">
                <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 transition-all focus-within:border-primary-brand focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary-brand/10">
                  <span className="material-symbols-outlined text-slate-400 mr-3 group-focus-within:text-primary-brand transition-colors">campaign</span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Nome da Campanha</label>
                    <input
                      placeholder="Ex: Verão 2025"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      value={newCampaign.name}
                      onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 transition-all focus-within:border-primary-brand focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary-brand/10">
                  <span className="material-symbols-outlined text-slate-400 mr-3 group-focus-within:text-primary-brand transition-colors">description</span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Descrição</label>
                    <input
                      placeholder="Ex: 20% OFF em cortes"
                      className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      value={newCampaign.description}
                      onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 group">
                  <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 transition-all focus-within:border-primary-brand focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary-brand/10">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Desconto</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="w-full bg-transparent text-lg font-black text-slate-900 outline-none placeholder:text-slate-300"
                          placeholder="0"
                          value={newCampaign.discount_percent || ''}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setNewCampaign({ ...newCampaign, discount_percent: Number(val) });
                          }}
                        />
                        <span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-[1.5] group">
                  <div className="relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 transition-all focus-within:border-primary-brand focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary-brand/10">
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Validade</label>
                      <input
                        type="date"
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                        value={newCampaign.end_date}
                        onChange={e => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleCreateCampaign} className="w-full bg-primary-brand text-white font-black py-4 rounded-2xl shadow-red-glow active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined group-hover:animate-bounce">rocket_launch</span>
                Lançar Campanha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerMarketing;
