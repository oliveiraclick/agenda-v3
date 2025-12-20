
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/upload';

interface OwnerTeamProps {
  onBack: () => void;
}

const OwnerTeam: React.FC<OwnerTeamProps> = ({ onBack }) => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPro, setNewPro] = useState({ name: '', role: '', commission: 0, image: '' });
  const [uploading, setUploading] = useState(false);

  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchEstablishmentAndPros();
  }, []);

  const fetchEstablishmentAndPros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get Establishment ID
    const { data: est } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (est) {
      setEstablishmentId(est.id);
      // 2. Fetch Pros for this Establishment
      const { data } = await supabase
        .from('professionals')
        .select('*')
        .eq('establishment_id', est.id);

      if (data) setProfessionals(data);
    }
    setLoading(false);
  };

  const handleAddProfessional = async () => {
    if (!newPro.name || !newPro.role) return alert('Preencha nome e cargo');
    if (!establishmentId) return alert('Estabelecimento não encontrado.');

    const { error } = await supabase.from('professionals').insert([
      {
        name: newPro.name,
        role: newPro.role,
        commission: newPro.commission,
        image: newPro.image || 'https://i.pravatar.cc/150?u=new',
        establishment_id: establishmentId // Link to current salon
      }
    ]);

    if (error) {
      alert('Erro ao adicionar profissional');
    } else {
      setShowModal(false);
      setNewPro({ name: '', role: '', commission: 0, image: '' });
      fetchEstablishmentAndPros();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const { publicUrl: url } = await uploadFile(file, 'avatars');
      if (url) setNewPro({ ...newPro, image: url });
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto relative view-transition">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="material-symbols-outlined text-slate-500">arrow_back</button>
          <h1 className="text-xl font-bold">Minha Equipe</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="size-10 bg-primary-brand text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><span className="material-symbols-outlined">add</span></button>
      </header>

      <main className="p-4 space-y-5 pb-24 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="text-2xl font-bold">{professionals.length}</span>
              <span className="material-symbols-outlined text-primary-brand bg-rose-50 p-1 rounded">group</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Ativos</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="text-2xl font-bold">4.8</span>
              <span className="material-symbols-outlined text-yellow-500 bg-yellow-50 p-1 rounded">star</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Média</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-center text-slate-400">Carregando...</p> : professionals.map(pro => (
            <div key={pro.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img src={pro.image} className="size-14 rounded-full border-2 border-white shadow-sm object-cover" />
                  <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-slate-900">{pro.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{pro.role}</p>
                </div>
                <button className="text-slate-300 hover:text-primary-brand"><span className="material-symbols-outlined">more_vert</span></button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Comissão</p>
                  <p className="font-bold text-primary-brand">{pro.commission}%</p>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Avaliação</p>
                  <p className="font-bold text-slate-600">5.0</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-lg font-bold mb-4">Novo Profissional</h2>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <label className="relative cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary-brand transition-colors overflow-hidden">
                    {newPro.image ? <img src={newPro.image} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">add_a_photo</span>}
                  </div>
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="text-xs font-bold">...</span></div>}
                </label>
              </div>
              <input
                placeholder="Nome completo"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                value={newPro.name}
                onChange={e => setNewPro({ ...newPro, name: e.target.value })}
              />
              <input
                placeholder="Cargo (ex: Barbeiro)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                value={newPro.role}
                onChange={e => setNewPro({ ...newPro, role: e.target.value })}
              />
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-500">Comissão (%)</span>
                <input
                  type="number"
                  className="flex-1 bg-transparent text-right font-bold border-none outline-none ring-0 focus:ring-0"
                  value={newPro.commission}
                  onChange={e => setNewPro({ ...newPro, commission: Number(e.target.value) })}
                />
              </div>
              <button onClick={handleAddProfessional} className="w-full bg-primary-brand text-white font-bold py-4 rounded-2xl shadow-red-glow active:scale-95 transition-all">
                Salvar Profissional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerTeam;
