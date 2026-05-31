import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Heart, Award, ArrowRight, MessageCircle, Quote, Star, ClipboardCheck, Zap, Scissors, Eye, Hand } from 'lucide-react';
import { Specialist, UserProfile } from '../types';
import { SPECIALISTS } from '../data';

interface SalonDashboardProps {
  onSuggestInspo: (query: string) => void;
  onNavigateToTab: (tab: string) => void;
  userProfile: UserProfile;
}

const INSPO_GALLERY = [
  {
    title: 'Luzes Honey Blonde Imperiais',
    desc: 'Iluminado avelã e mel super sutil, ideal para dar profundidade e brilho sem ressecar o fio capilar.',
    tags: ['Cabelos', 'Luzes'],
    query: 'Gostaria de saber mais sobre as técnicas e cuidados pós Balayage Mechas Honey Blonde',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300'
  },
  {
    title: 'Skincare Glass Skin Perfeito',
    desc: 'Protocolo de hidratação intensa que deixa a textura da pele viçosa, translúcida e livre de poros visíveis.',
    tags: ['Estética', 'Glow'],
    query: 'Pode me dar rotinas ou indicar serviços para obter o efeito Glass Skin na pele mista?',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=300'
  },
  {
    title: 'Formato Almond Gel Nails',
    desc: 'Unhas amendoadas que alongam visualmente as mãos e reduzem a quebra, feitas em fibra premium.',
    tags: ['Unhas', 'Alongamento'],
    query: 'Quais as melhores decorações e cuidados para Alongamento de Unhas no formato Almond?',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=300'
  },
  {
    title: 'Efeito Lash Lifting Superior',
    desc: 'Curvatura natural extraordinária dos próprios cílios, eliminando o uso diário de rímel e curvex.',
    tags: ['Olhar', 'Lifting'],
    query: 'O que é o Lash Lifting e quais cuidados devo tomar para fazer durar mais tempo?',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300'
  }
];

export default function SalonDashboard({ onSuggestInspo, onNavigateToTab, userProfile }: SalonDashboardProps) {
  const [selectedInspo, setSelectedInspo] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn" id="salon-dashboard-section">
      {/* Editorial High-End Premium Banner */}
      <div className="relative bg-[#1a0e12] rounded-3xl overflow-hidden min-h-[400px] flex flex-col md:flex-row items-center p-6 md:p-12 text-white border border-rose-950/20 gap-8">
        {/* Absolute Background image with custom soft opacity layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/next_lady_cover_1780188650783.png"
            alt="Next Lady Luxury Goddess Cover"
            className="w-full h-full object-cover opacity-65 md:opacity-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#170c10] via-[#201015]/90 to-[#10060a]/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3d232e] text-amber-200 font-sans text-xs font-semibold uppercase tracking-wider shadow">
            <Sparkles className="w-3.5 h-3.5" /> Beleza Com Arte & Ciência de Visagismo
          </span>
          <h2 className="font-display font-light text-2xl md:text-4xl leading-tight tracking-tight">
            Sua essência <strong className="font-semibold font-display text-amber-200 block italic md:inline"> lapidada com luxo</strong>
          </h2>
          <p className="text-xs md:text-sm font-sans text-stone-250 leading-relaxed font-light">
            Seja bem-vinda de braços abertos ao ecossistema **Next Lady**, um espaço interativo de autocuidado idealizado para mulheres únicas. Aqui unimos terapias estéticas limpas, compras de mimos de alta perfumaria e uma comunidade de apoio dedicada. No login, as regras sumiram: você é VIP imediata!
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateToTab('catalogo')}
              className="bg-[#3d232e] hover:bg-[#1a0f14] px-6 py-3.5 rounded-2xl font-sans text-xs font-bold text-amber-200 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-98 border border-stone-800"
              type="button"
            >
              Conhecer Tratamentos
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('BellaAI')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 px-6 py-3.5 rounded-2xl font-sans text-xs font-bold text-stone-100 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              type="button"
            >
              Consultora Next AI
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>

        {/* Active Profile Status Glass Card (Capa de Perfil / Online Status) */}
        {userProfile.name && (
          <div className="relative z-10 w-full md:w-80 bg-black/45 backdrop-blur-lg border border-white/15 p-6 rounded-3xl space-y-4 text-left select-none shadow-2xl shrink-0 self-stretch flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans font-extrabold uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Online
                </span>
                <span className="text-[9px] bg-amber-500/20 border border-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-lg uppercase">
                  LADY VIP
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="relative shrink-0">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-200/90 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#1a0e12] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-medium text-stone-50 text-sm truncate leading-tight">{userProfile.name}</h4>
                  <p className="text-[10px] text-stone-400 font-sans mt-0.5 capitalize">{userProfile.role} Credenciada</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wide block">Pontos Acumulados</span>
                <span className="font-mono text-base font-bold text-amber-200 block mt-0.5">{userProfile.points} pts</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('relatorios')}
                className="bg-white/15 hover:bg-white/20 text-stone-100 font-sans text-[10px] font-bold px-3.5 py-2.5 rounded-xl transition-all border border-white/10"
              >
                Acessar Ata
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Specialty Interactive Inspo Mood Board */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-base md:text-lg">Mural de Inspirações Estéticas</h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">Selecione uma inspiração para ver detalhes de tratamentos e planeje o visagismo com nossa inteligência artificial!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INSPO_GALLERY.map((inspo, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedInspo(selectedInspo === idx ? null : idx)}
              className={`bg-white border rounded-3xl overflow-hidden cursor-pointer transition-all ${
                selectedInspo === idx
                  ? 'border-rose-450 ring-1 ring-[#3d232e] shadow-md'
                  : 'border-rose-50/55 shadow-xs hover:border-stone-400'
              }`}
            >
              <div className="h-40 overflow-hidden relative bg-stone-100">
                <img
                  src={inspo.image}
                  alt={inspo.title}
                  className="w-full h-full object-cover transition-transform hover:scale-103 duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  {inspo.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="bg-[#24131a]/90 backdrop-blur-md text-amber-200 font-sans font-bold text-[8px] px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="font-display font-semibold text-gray-800 text-xs md:text-sm">{inspo.title}</h4>
                <p className="text-[11px] text-gray-500 font-sans line-clamp-2 leading-relaxed">
                  {inspo.desc}
                </p>

                {selectedInspo === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3.5 border-t border-rose-50 mt-3 space-y-2.5"
                  >
                    <p className="text-[10px] text-stone-700 font-sans font-light flex items-center gap-1.5 bg-rose-50/25 p-2 rounded-xl">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Protocolo exclusivo feito por visagistas credenciadas.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuggestInspo(inspo.query);
                      }}
                      className="w-full bg-[#3d232e] hover:bg-[#1f1116] text-amber-200 font-sans text-[10px] font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Visagismo por IA
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promos & Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Promos */}
        <div className="bg-white border border-rose-50 rounded-3xl p-6 flex gap-4.5 items-center shadow-xs">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#3d232e] shrink-0">
            <Award className="w-6 h-6 text-[#3d232e]" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] bg-[#3d232e] text-amber-200 font-sans font-bold uppercase px-2 py-0.5 rounded-full inline-block tracking-wider">Limpa & Sustentável</span>
            <h4 className="font-display font-semibold text-gray-800 text-xs md:text-sm">Garantia Dermocosmética</h4>
            <p className="text-xs text-stone-500 font-sans leading-relaxed font-light">
              Nossos tratamentos e mimos são feitos com produtos orgânicos de alta estirpe, livres de parabenos e metais pesados.
            </p>
          </div>
        </div>

        {/* Banner 2: VIP community */}
        <div className="bg-white border border-rose-50 rounded-3xl p-6 flex gap-4.5 items-center shadow-xs">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <Quote className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] bg-amber-550 text-amber-950 font-sans font-bold uppercase px-2 py-0.5 rounded-full inline-block tracking-wider bg-amber-400">Prêmio Lady</span>
            <h4 className="font-display font-semibold text-gray-800 text-xs md:text-sm">Indique Amigas, Compartilhe Amor</h4>
            <p className="text-xs text-stone-500 font-sans leading-relaxed font-light">
              Membros Next Lady engajadas participam de eventos e cursos exclusivos gratuitos, além de obter descontos especiais em produtos.
            </p>
          </div>
        </div>
      </div>

      {/* Meet our specialists */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-base md:text-lg">Nossas Profissionais</h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5 font-light">Visagistas premiadas e especialistas qualificadas em estética integrativa prontas para cuidar de você</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALISTS.map(sp => (
            <div
              key={sp.id}
              className="bg-white border border-rose-50 rounded-3xl p-5 text-center shadow-xs hover:border-stone-400 transition-colors flex flex-col items-center space-y-4"
              id={`specialist-${sp.id}`}
            >
              <div className="relative">
                <img
                  src={sp.avatar}
                  alt={sp.name}
                  className="w-18 h-18 rounded-full object-cover border-2 border-rose-100"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 bg-stone-900 border border-stone-800 text-amber-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                  ★ {sp.rating.toFixed(1)}
                </span>
              </div>

              <div className="space-y-1 flex-1">
                <h4 className="font-display font-semibold text-gray-800 text-xs">{sp.name}</h4>
                <p className="text-[10px] text-rose-550 font-sans font-bold uppercase tracking-wider">{sp.role}</p>
                
                <div className="flex justify-center flex-wrap gap-1.5 pt-2">
                  {sp.specialties.slice(0, 2).map((spec, sIdx) => (
                    <span key={sIdx} className="text-[8px] bg-stone-50 border border-stone-150 text-gray-500 font-sans px-2 py-0.5 rounded-md uppercase tracking-wide font-semibold">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('agendar')}
                className="w-full bg-[#3d232e]/5 hover:bg-[#3d232e] text-[#3d232e] hover:text-white font-sans text-xs font-bold py-2.5 rounded-xl transition-all border border-stone-100 cursor-pointer"
              >
                Reservar Horário
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
