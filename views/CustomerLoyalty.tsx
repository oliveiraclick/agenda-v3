
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoyaltyCard, LoyaltyReward } from '../types';
import { toast } from 'sonner';

interface CustomerLoyaltyProps {
  onBack: () => void;
}

const CustomerLoyalty: React.FC<CustomerLoyaltyProps> = ({ onBack }) => {
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const totalNeeded = 10;

  // Use current stamps or 0
  const currentStamps = card?.stamps || 0;

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch User's Card
      const { data: cards, error: cardError } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (cardError) throw cardError;

      if (cards && cards.length > 0) {
        setCard(cards[0]);
      }

      // 2. Fetch Rewards
      // Ideally we should filter by the establishment of the card, or all active rewards if app is multi-tenant properly
      // For now, fetching all active rewards or filtering by the establishment found in card
      let query = supabase.from('loyalty_rewards').select('*').eq('active', true).order('cost', { ascending: true });

      if (cards && cards.length > 0) {
        query = query.eq('establishment_id', cards[0].establishment_id);
      }

      const { data: rewardsData, error: rewardsError } = await query;

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      toast.error('Erro ao carregar dados de fidelidade');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (currentStamps < reward.cost) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: user.id,
        p_reward_id: reward.id
      });

      if (error) throw error;

      toast.success('Recompensa resgatada com sucesso!');

      // Update local state
      if (card) {
        setCard({ ...card, stamps: card.stamps - reward.cost });
      }

    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      toast.error(error.message || 'Erro ao resgatar recompensa');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <header className="p-6 bg-white flex items-center gap-4 border-b">
        <button onClick={onBack} className="size-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </button>
        <h2 className="text-xl font-black tracking-tighter">Fidelidade</h2>
      </header>

      <main className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-brand"></div>
          </div>
        ) : !card ? (
          <div className="text-center py-10 text-slate-400">
            <p>Nenhum cartão fidelidade encontrado.</p>
          </div>
        ) : (
          <>
            {/* Cartão de Destaque */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-primary-brand/20">
              {/* Círculos decorativos de fundo */}
              <div className="absolute -right-10 -top-10 size-40 bg-primary-brand/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -left-10 -bottom-10 size-40 bg-blue-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-md">Barbearia Elite</span>
                <h3 className="text-3xl font-black mb-1">Cartão VIP</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">
                  {currentStamps >= totalNeeded
                    ? "Parabéns! Você completou seu cartão!"
                    : `Faltam apenas ${totalNeeded - currentStamps} para o seu prémio!`}
                </p>

                {/* Grid de Selos */}
                <div className="grid grid-cols-5 gap-3 justify-items-center">
                  {Array.from({ length: totalNeeded }).map((_, i) => {
                    const isCompleted = i < currentStamps;
                    return (
                      <div
                        key={i}
                        className={`size-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                          ? 'bg-primary-brand border-primary-brand shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110'
                          : 'bg-white/5 border-white/10'
                          }`}
                      >
                        {isCompleted && (
                          <span className="material-symbols-outlined text-white text-xl font-black animate-in zoom-in spin-in-180 duration-300">check</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recompensas */}
            <div className="space-y-4">
              <h3 className="font-black text-lg px-2">Recompensas Disponíveis</h3>

              {rewards.map((reward) => {
                const canRedeem = currentStamps >= reward.cost;
                return (
                  <div key={reward.id} className={`bg-white p-5 rounded-[2rem] border transition-all duration-300 ${canRedeem ? 'border-primary-brand/20 shadow-lg shadow-primary-brand/5' : 'border-slate-100 shadow-sm opacity-60 grayscale'} flex items-center gap-4`}>
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${canRedeem ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined">{reward.title.toLowerCase().includes('corte') ? 'content_cut' : 'local_cafe'}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{reward.title}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-1">Necessário {reward.cost} selos</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem || processing}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${canRedeem
                          ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-800 active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {processing ? '...' : canRedeem ? 'Resgatar' : 'Bloqueado'}
                    </button>
                  </div>
                );
              })}

              {rewards.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm">Nenhuma recompensa ativa.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerLoyalty;
