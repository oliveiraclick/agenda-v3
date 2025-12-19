
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CustomerLoyaltyProps {
  onBack: () => void;
}

const CustomerLoyalty: React.FC<CustomerLoyaltyProps> = ({ onBack }) => {
  const [stamps, setStamps] = useState(6); // Exemplo: 6 selos acumulados
  const totalNeeded = 10;
  const [loading, setLoading] = useState(false);

  // Simulação de busca de dados reais
  useEffect(() => {
    // Aqui no futuro faremos: 
    // const { count } = await supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'completed')
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <header className="p-6 bg-white flex items-center gap-4 border-b">
        <button onClick={onBack} className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </button>
        <h2 className="text-xl font-black tracking-tighter">Fidelidade</h2>
      </header>

      <main className="p-6 space-y-6">
        {/* Cartão de Destaque */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
          {/* Círculos decorativos de fundo */}
          <div className="absolute -right-10 -top-10 size-40 bg-primary-brand/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 size-40 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Barbearia Elite</span>
            <h3 className="text-3xl font-black mb-1">Cartão VIP</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Faltam apenas {totalNeeded - stamps} para o seu prémio!</p>

            {/* Grid de Selos */}
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {Array.from({ length: totalNeeded }).map((_, i) => (
                <div
                  key={i}
                  className={`size-12 rounded-full flex items-center justify-center border-2 transition-all ${i < stamps
                      ? 'bg-primary-brand border-primary-brand shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-white/5 border-white/10'
                    }`}
                >
                  {i < stamps && (
                    <span className="material-symbols-outlined text-white text-xl font-black">check</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="space-y-4">
          <h3 className="font-black text-lg px-2">Recompensas Disponíveis</h3>

          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 opacity-50 grayscale">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">content_cut</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Corte Grátis</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">Necessário 10 selos</p>
            </div>
            <button disabled className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold">Bloqueado</button>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">local_cafe</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Bebida Grátis</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">Necessário 5 selos</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-lg">Resgatar</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerLoyalty;
