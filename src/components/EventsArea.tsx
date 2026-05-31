import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Clock, User, Check, AlertCircle, BookmarkCheck, Star, Pin } from 'lucide-react';
import { EventItem, UserProfile } from '../types';
import { EVENTS } from '../data';

interface EventsAreaProps {
  userProfile: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
}

export default function EventsArea({ userProfile, onUpdateUser, onAddNotification }: EventsAreaProps) {
  const [successEvent, setSuccessEvent] = useState<EventItem | null>(null);

  const handleRSVP = (event: EventItem) => {
    const list = userProfile.rsvpEvents || [];
    if (list.includes(event.id)) return; // Already RSVP'd

    // Update RSVP list
    const updatedRSVPs = [...list, event.id];
    
    // Add Points
    const oldPoints = userProfile.points || 0;
    const newPoints = oldPoints + event.pointsGranted;

    onUpdateUser({
      ...userProfile,
      rsvpEvents: updatedRSVPs,
      points: newPoints
    });

    onAddNotification(
      'Inscrição Confirmada! 🗓️',
      `Você garantiu sua vaga no evento: ${event.title}. Ganhou +${event.pointsGranted} pontos Next Lady!`,
      'promocao'
    );

    // Increment attendeesCount in local state simulation
    event.attendeesCount += 1;

    setSuccessEvent(event);
  };

  return (
    <div className="space-y-8" id="events-area-section">
      
      {/* Banner Intro */}
      <div className="relative bg-gradient-to-br from-[#12161a] to-[#252f3d] border border-stone-800/80 rounded-3xl p-6.5 md:p-10 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-sky-400/10 to-[#b58c97]/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 font-sans text-xs font-semibold uppercase tracking-wider border border-sky-500/20">
            <BookmarkCheck className="w-3.5 h-3.5" /> Eventos & Mentorias Próprias
          </span>
          <h2 className="font-display font-light text-2xl md:text-4xl leading-tight">
            Aprendizado & <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-rose-300 to-sky-200 block italic md:inline">Networking de Alto Valor</strong>
          </h2>
          <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-light">
            Participe de workshops presenciais sobre visagismo facial, aulas práticas de automaquiagem com profissionais renomadas e congressos de empreendedorismo que transformam sua mentalidade. <strong>Garante pontos extras de fidelidade ao confirmar RSVPs!</strong>
          </p>
        </div>
      </div>

      {/* Events Listing Panel */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-semibold text-gray-800 text-lg">Próximos Encontros & Palestras</h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Garanta sua presença para expandir sua rede de contatos e conquistar vantagens VIP.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {EVENTS.map((event) => {
            const isRSVPed = (userProfile.rsvpEvents || []).includes(event.id);
            return (
              <div
                key={event.id}
                className="bg-white border border-[#eae6e8] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row"
              >
                {/* Photo space */}
                <div className="md:w-48 h-48 md:h-auto relative bg-stone-50 shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-[#111827]/90 text-white font-sans text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {event.category}
                  </span>
                </div>

                {/* Event info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold font-sans">
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> Recompensa: +{event.pointsGranted} pts
                    </span>
                    <h4 className="font-display font-semibold text-gray-800 text-sm leading-snug">
                      {event.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-sans line-clamp-2 leading-relaxed font-light font-sans">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-55 flex flex-wrap items-center justify-between gap-1 gap-y-2">
                    <div className="flex gap-4.5 text-[10px] text-stone-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {event.time}h
                      </span>
                    </div>

                    <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      Mentora: <strong>{event.instructor}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-stone-400 font-sans font-light">
                      Confirmados: <strong className="text-stone-700 font-mono font-bold">{event.attendeesCount}</strong> ladies
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRSVP(event)}
                      disabled={isRSVPed}
                      className={`font-sans text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        isRSVPed
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 cursor-default'
                          : 'bg-[#29171e] hover:bg-black text-amber-200 border border-transparent shadow shadow-rose-950/20 active:scale-98'
                      }`}
                    >
                      {isRSVPed ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Presença Confirmada!
                        </>
                      ) : (
                        'Garantir Minha Vaga'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Confirmation Dialog */}
      <AnimatePresence>
        {successEvent && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-medium text-stone-850 text-[14px] uppercase tracking-wide">Vaga Reservada com Sucesso!</h3>
                <h4 className="text-xs text-stone-700 font-display font-semibold px-2">{successEvent.title}</h4>
              </div>

              <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                Parabéns! Sua vaga está garantida. Enviamos detalhes sobre o local e preparação para seu e-mail cadastrado.
              </p>

              <div className="bg-[#fff9fa] border border-rose-50 p-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-[10px] text-rose-500 font-semibold font-sans">
                <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                <span>Você ganhou <strong>+{successEvent.pointsGranted} pontos</strong> de fidelidade!</span>
              </div>

              <button
                onClick={() => setSuccessEvent(null)}
                className="w-full bg-[#29171e] hover:bg-[#150c0f] text-amber-200 font-sans text-xs font-bold py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Ótimo!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
