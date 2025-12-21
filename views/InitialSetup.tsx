
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface InitialSetupProps {
  onComplete: () => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoStatus('validating');

    try {
      // 1. Validate & Apply via Secure RPC
      const { data, error } = await supabase.rpc('apply_promo_code', { input_code: promoCode });

      if (error) throw error;

      if (data && data.success) {
        setPromoStatus('success');
        setPromoMessage(`Código aplicado! Você ganhou ${data.days} dias grátis.`);
        // Note: The establishments table update happens on the server
      } else {
        setPromoStatus('error');
        setPromoMessage(data?.message || 'Código inválido ou expirado.');
      }
    } catch (err) {
      console.error(err);
      setPromoStatus('error');
      setPromoMessage('Erro ao validar código.');
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="p-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-lg font-bold">Configuração Inicial</h2>
        <button onClick={onComplete} className="text-primary-brand font-bold text-sm">Salvar</button>
      </header>

      <div className="px-4 py-4 bg-rose-50 border-b border-rose-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-primary-brand">Progresso do Setup</h3>
          <span className="text-xs font-bold text-primary-brand">50% Completo</span>
        </div>
        <div className="h-2 w-full bg-white rounded-full overflow-hidden">
          <div className="h-full bg-primary-brand" style={{ width: '50%' }}></div>
        </div>
      </div>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-primary-brand text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="font-bold text-base">Dados do Negócio</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-rose-100 shadow-card">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Nome do Negócio</span>
                <input type="text" className="w-full h-12 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-primary-brand" placeholder="Ex: Studio VIP ou Seu Nome" />
              </label>

              {/* Promo Code Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">Código Promocional</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 h-10 rounded-xl bg-slate-50 border-none text-sm font-bold uppercase focus:ring-2 focus:ring-primary-brand ${promoStatus === 'success' ? 'text-emerald-600 bg-emerald-50' : ''}`}
                      placeholder="#CUPOM"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={promoStatus === 'success'}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode || promoStatus === 'validating' || promoStatus === 'success'}
                      className={`px-4 h-10 rounded-xl font-bold text-xs transition-colors ${promoStatus === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                      {promoStatus === 'validating' ? '...' : promoStatus === 'success' ? 'Aplicado' : 'Aplicar'}
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-xs font-bold mt-2 ${promoStatus === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {promoMessage}
                    </p>
                  )}
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-white transition-colors">
                <div className="size-8 bg-rose-100 text-primary-brand rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">schedule</span></div>
                <div className="flex-1"><p className="text-sm font-bold">Definir Horários</p></div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 opacity-70">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-bold text-base">Cadastrar Serviços</h3>
          </div>
          <button className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:border-primary-brand hover:text-primary-brand transition-colors">
            <span className="material-symbols-outlined text-3xl">add_circle</span>
            <span className="text-sm font-bold">Adicionar pelo menos um serviço</span>
          </button>
        </div>
      </main>

      <div className="p-4 bg-white border-t border-slate-100">
        <button
          onClick={onComplete}
          className="w-full bg-primary-brand py-5 rounded-2xl text-white font-bold shadow-red-glow flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          Finalizar Configuração <span className="material-symbols-outlined">check</span>
        </button>
      </div>
    </div>
  );
};

export default InitialSetup;
