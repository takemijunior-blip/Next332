import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Check, ArrowRight, Zap, HelpCircle, Gift, Crown, GiftIcon } from 'lucide-react';
import { UserProfile, LoyaltyReward } from '../types';
import { LOYALTY_REWARDS } from '../data';

interface LoyaltyHubProps {
  userProfile: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function LoyaltyHub({ userProfile, onUpdateUser, onAddNotification }: LoyaltyHubProps) {
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [successRedeem, setSuccessRedeem] = useState<LoyaltyReward | null>(null);
  const [redeemedCode, setRedeemedCode] = useState('');

  const currentPoints = userProfile.points || 0;

  // Redeem Logic
  const handleRedeem = (reward: LoyaltyReward) => {
    if (currentPoints < reward.cost) return;

    const code = `VIP-${reward.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const updatedPoints = currentPoints - reward.cost;
    const redeemedList = userProfile.redeemedRewards || [];

    onUpdateUser({
      ...userProfile,
      points: updatedPoints,
      redeemedRewards: [...redeemedList, reward.id]
    });

    onAddNotification(
      'Recompensa Resgatada! 🎁',
      `Você trocou ${reward.cost} pontos por: ${reward.title}. Use o código ${code} em nosso espaço físico ou e-commerce!`,
      'sistema'
    );

    setRedeemedCode(code);
    setSuccessRedeem(reward);
    setSelectedReward(null);
  };

  return (
    <div className="space-y-8" id="loyalty-club-section">
      {/* Golden Luxury Points Header Card */}
      <div className="relative bg-gradient-to-br from-[#1a110a] via-[#2d1b10] to-[#120803] rounded-3xl p-6.5 md:p-10 text-white border border-[#4a311d] shadow-xl overflow-hidden">
        
        {/* Glowing Background Core elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/20 to-rose-400/10 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Circular SVG balance representation */}
          <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              
              {/* Outer Golden Border Glow ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="42" 
                  className="stroke-amber-900/40 fill-none" 
                  strokeWidth="3.5"
                />
                <circle 
                  cx="50" cy="50" r="42" 
                  className="stroke-amber-400 fill-none transition-all duration-1000" 
                  strokeWidth="4"
                  strokeDasharray={`${(Math.min(currentPoints, 500) / 500) * 263} 263`}
                  strokeLinecap="round"
                />
              </svg>

              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-amber-300 font-sans tracking-widest font-semibold uppercase block">SALDO LADY</span>
                <span className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 font-mono tracking-tight leading-none block">
                  {currentPoints}
                </span>
                <span className="text-[10px] text-stone-400 font-sans block">pontos</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-amber-200 font-sans flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                <Crown className="w-3.5 h-3.5" />
                {currentPoints >= 500 ? 'Membro Diamond VIP' : currentPoints >= 300 ? 'Membro Gold Star' : 'Membro Silver Lady'}
              </span>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="md:col-span-7 space-y-4">
            <h2 className="font-display font-light text-2xl md:text-3xl leading-snug">
              Clube de Fidelidade <strong className="font-bold text-amber-200 italic font-display">Lady Vantagem</strong>
            </h2>
            <p className="text-xs text-stone-300/95 leading-relaxed font-light">
              Na Next Lady, sua presença e engajamento valem mimos reais. Veja como é fácil acumular e multiplicar pontos no ecossistema estético:
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] text-[#cca072] font-semibold font-sans tracking-wide uppercase">Agendamentos</span>
                <p className="text-xs font-semibold text-stone-100 font-sans">+50 pts por atendimento</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] text-[#cca072] font-semibold font-sans tracking-wide uppercase">Dicas e Social</span>
                <p className="text-xs font-semibold text-stone-100 font-sans">+20 pts por post na comunidade</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] text-[#cca072] font-semibold font-sans tracking-wide uppercase">E-commerce</span>
                <p className="text-xs font-semibold text-stone-100 font-sans">Retorno express em cada produto</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] text-[#cca072] font-semibold font-sans tracking-wide uppercase">Workshops</span>
                <p className="text-xs font-semibold text-stone-100 font-sans">+100-150 pts por inscrição</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Perks and Rewards to Redeem */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-lg">Recompensas Exclusivas</h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Selecione e troque seus pontos por descontos reais, mimos físicos ou cortes cortesia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {LOYALTY_REWARDS.map(reward => {
            const isAffordable = currentPoints >= reward.cost;
            return (
              <div
                key={reward.id}
                className={`bg-white border rounded-3xl p-5 border-stone-100 flex flex-col justify-between space-y-4 shadow-sm relative ${
                  !isAffordable ? 'opacity-85' : 'hover:shadow-md transition-shadow'
                }`}
              >
                <div className="absolute top-4 right-4 bg-amber-500/10 text-[#a37244] border border-amber-500/20 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold">
                  {reward.cost} pts
                </div>

                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider font-sans">
                    {reward.type === 'desconto' ? '🏷️ Cupom de Loja' : reward.type === 'servico' ? '💈 Procedimento' : reward.type === 'produto' ? '💄 Dermocosmético' : '👑 Benefício VIP'}
                  </span>
                  <h4 className="font-display font-semibold text-gray-800 text-xs pr-14 leading-snug">
                    {reward.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed pt-1.5 font-light">
                    {reward.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isAffordable) {
                      setSelectedReward(reward);
                    }
                  }}
                  disabled={!isAffordable}
                  className={`w-full font-sans text-[11px] font-bold py-2.5 rounded-xl text-center uppercase tracking-wider transition-colors ${
                    isAffordable
                      ? 'bg-[#2d1b10] hover:bg-[#120803] text-amber-200 cursor-pointer shadow'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  }`}
                >
                  {isAffordable ? 'Resgatar Agora' : `Faltam ${reward.cost - currentPoints} pts`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Redeem Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-sm w-full border border-amber-100 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <GiftIcon className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-semibold text-stone-800 text-sm uppercase">Confirmar Troca de Pontos</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-sans font-light">
                  Você está prestes a debitar <strong className="font-mono text-stone-800">{selectedReward.cost} pontos</strong> do seu saldo para liberar: 
                  <strong className="block text-stone-800 font-medium pt-1">"{selectedReward.title}"?</strong>
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-sans text-[11px] font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRedeem(selectedReward)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-[#a37244] hover:from-amber-600 hover:to-[#8f5f34] text-white font-sans text-[11px] font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirmar Resgatar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Code Success Sheet */}
      <AnimatePresence>
        {successRedeem && (
          <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-amber-100 shadow-2xl p-6.5 max-w-sm w-full text-center space-y-5"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-medium text-stone-850 text-base">Recompensa Pronta! 🎉</h3>
                <p className="text-[11px] text-stone-400 font-sans">Apresente ou aplique o cupom abaixo:</p>
              </div>

              <div className="bg-[#fffdfa] border border-amber-100/50 p-4.5 rounded-2xl space-y-2">
                <span className="text-[9px] text-amber-600 font-mono font-bold tracking-wide block uppercase leading-none">CÓDIGO EXCLUSIVO NEXT LADY</span>
                <span className="font-mono text-base font-black text-stone-900 tracking-wider block bg-white border border-stone-200 py-1.5 rounded-xl shadow-xs">
                  {redeemedCode}
                </span>
                <span className="text-[9px] text-stone-400 block font-sans">Validade de 90 dias após emissão</span>
              </div>

              <p className="text-[11px] text-stone-500 font-sans leading-relaxed px-2 font-light">
                O código de resgate também foi guardado em seu perfil e adicionado em suas notificações. Você já pode utilizá-lo!
              </p>

              <button
                onClick={() => setSuccessRedeem(null)}
                className="w-full bg-[#2d1b10] hover:bg-[#120803] text-amber-200 font-sans text-xs font-bold py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Concluir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
