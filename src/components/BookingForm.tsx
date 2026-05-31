import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, ListOrdered, CalendarCheck, Trash2, ShieldCheck, Award } from 'lucide-react';
import { ServiceItem, Specialist, Appointment, UserProfile } from '../types';
import { SPECIALISTS } from '../data';

interface BookingFormProps {
  preselectedService: ServiceItem | null;
  onClearPreselected: () => void;
  onBookingSuccess: () => void;
  userProfile: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
  servicesDb: ServiceItem[];
  appointments: Appointment[];
  onUpdateAppointments: (updated: Appointment[]) => void;
}

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingForm({
  preselectedService,
  onClearPreselected,
  onBookingSuccess,
  userProfile,
  onUpdateUser,
  onAddNotification,
  servicesDb,
  appointments,
  onUpdateAppointments
}: BookingFormProps) {


  // Booking Flow steps
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedService?.id || '');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  
  // Client forms preloaded from profile
  const [clientName, setClientName] = useState(userProfile.name || '');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const [tabView, setTabView] = useState<'novomarcacao' | 'minhasmarcacoes'>('novomarcacao');
  const [justBooked, setJustBooked] = useState<Appointment | null>(null);

  // Prefill fields from userProfile when they load or complete registration
  useEffect(() => {
    if (userProfile.name) {
      setClientName(userProfile.name);
    }
  }, [userProfile]);

  // Sync state on preselect changes
  useEffect(() => {
    if (preselectedService) {
      setSelectedServiceId(preselectedService.id);
      setTabView('novomarcacao');
    }
  }, [preselectedService]);

  // Dynamic filter for specialists matching the service's category
  const activeService = servicesDb.find(s => s.id === selectedServiceId);
  const eligibleSpecialists = SPECIALISTS.filter(specialist => {
    if (!activeService) return true;
    return specialist.specialties.includes(activeService.category);
  });

  const handleCreateAppointment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedSpecialistId || !bookingDate || !bookingTime || !clientName.trim() || !clientPhone.trim()) {
      alert('Por favor preencha todos os campos obrigatórios (*).');
      return;
    }

    const apptId = `appt-${Date.now()}`;
    const newAppointment: Appointment = {
      id: apptId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || 'cliente@nextlady.com.br',
      serviceId: selectedServiceId,
      specialistId: selectedSpecialistId,
      date: bookingDate,
      time: bookingTime,
      notes: clientNotes.trim() || undefined,
      status: 'CONFIRMADO', // Instant booking confirmation for elegant interactive feels
      createdAt: new Date().toISOString(),
      pointsGranted: 50 // Gained points for scheduling
    };

    // Update Local Lists
    onUpdateAppointments([newAppointment, ...appointments]);
    setJustBooked(newAppointment);

    // Grant Points to user
    const currentPoints = userProfile.points || 0;
    onUpdateUser({
      ...userProfile,
      points: currentPoints + 50
    });

    // Notify User
    onAddNotification(
      'Agendamento Confirmado! 📅',
      `Sua reserva para ${activeService?.name} no dia ${new Date(bookingDate).toLocaleDateString('pt-BR')} às ${bookingTime} foi confirmada. Você acumulou +50 pontos de fidelidade!`,
      'agendamento'
    );

    // Clear and reset scheduling form state
    setSelectedServiceId('');
    setSelectedSpecialistId('');
    setBookingDate('');
    setBookingTime('');
    setClientNotes('');
    onClearPreselected();
    onBookingSuccess();
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Quer mesmo estornar ou cancelar esse agendamento do Next Lady, querida?')) {
      const updated = appointments.map(appt => {
        if (appt.id === id) return { ...appt, status: 'CANCELADO' as const };
        return appt;
      });
      onUpdateAppointments(updated);
      
      onAddNotification(
        'Agendamento Cancelado 🔒',
        `Seu procedimento foi cancelado com sucesso. Esperamos te ver em breve!`,
        'agendamento'
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden animate-fadeIn" id="scheduling-panel">
      {/* Tabs */}
      <div className="flex border-b border-rose-100/50 bg-stone-50">
        <button
          type="button"
          onClick={() => { setTabView('novomarcacao'); setJustBooked(null); }}
          className={`flex-1 font-sans text-xs font-bold py-4.5 uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            tabView === 'novomarcacao'
              ? 'text-rose-500 border-rose-500 bg-white'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Novo Agendamento
        </button>
        <button
          type="button"
          onClick={() => { setTabView('minhasmarcacoes'); setJustBooked(null); }}
          className={`flex-1 font-sans text-xs font-bold py-4.5 uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            tabView === 'minhasmarcacoes'
              ? 'text-rose-500 border-rose-500 bg-white'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Meus Agendamentos ({appointments.filter(a => a.status === 'CONFIRMADO').length})
        </button>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {tabView === 'novomarcacao' ? (
            <motion.div
              key="novo"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {justBooked ? (
                // Success screen
                <div className="text-center py-12 space-y-6 animate-fadeIn" id="booking-success-view">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-400">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold text-gray-800 text-xl">Horário Marcado com Sucesso!</h4>
                    <p className="text-sm font-sans text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Sua reserva no Next Lady foi realizada com todo o carinho e dignidade do mundo! Nós já preparamos tudo e estamos te esperando com um delicioso buffet.
                    </p>
                  </div>

                  {/* Summary ticket */}
                  <div className="bg-stone-50 rounded-3xl border border-rose-100 p-6 text-left max-w-md mx-auto space-y-3.5 text-xs font-sans">
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-gray-400 font-medium">Procedimento:</span>
                      <span className="text-gray-800 font-semibold">{servicesDb.find(s => s.id === justBooked.serviceId)?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-gray-400 font-medium">Especialista:</span>
                      <span className="text-gray-800 font-semibold">{SPECIALISTS.find(sp => sp.id === justBooked.specialistId)?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-gray-400 font-medium">Data:</span>
                      <span className="text-gray-800 font-mono font-semibold">{new Date(justBooked.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                      <span className="text-gray-400 font-medium">Horário reservado:</span>
                      <span className="text-rose-600 font-mono font-bold text-xs bg-rose-50 px-2.5 py-0.5 rounded-lg">{justBooked.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600 font-semibold">
                      <span className="flex items-center gap-1"><Award className="w-4 h-4 animate-pulse text-amber-500" /> Fidelidade Resgatada:</span>
                      <span>+50 pontos ganhos!</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setJustBooked(null)}
                      className="bg-[#29171e] hover:bg-[#120a0d] text-amber-200 font-sans text-xs font-bold px-6 py-3.5 rounded-2xl transition-colors shadow shadow-rose-950/20 cursor-pointer"
                    >
                      Solicitar Outro Serviço
                    </button>
                    <button
                      type="button"
                      onClick={() => setTabView('minhasmarcacoes')}
                      className="bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-sans text-xs font-bold px-6 py-3.5 rounded-2xl transition-colors cursor-pointer"
                    >
                      Acessar Minha Agenda
                    </button>
                  </div>
                </div>
              ) : (
                // Fill Form
                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  {/* Service selector */}
                  <div>
                    <label className="text-xs font-sans text-gray-500 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-[#3d232e]" /> 1. Escolha o Procedimento Nex Lady *
                    </label>
                    <select
                      required
                      value={selectedServiceId}
                      onChange={(e) => {
                        setSelectedServiceId(e.target.value);
                        setSelectedSpecialistId(''); // reset specialist if category changes
                      }}
                      className="w-full bg-stone-50 border border-rose-100 px-4 py-3.5 rounded-2xl text-xs focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans focus:outline-none focus:bg-white cursor-pointer"
                    >
                      <option value="">Selecione um de nossos tratamentos de luxo listados...</option>
                      {servicesDb.map(service => (
                        <option key={service.id} value={service.id}>
                          [{service.category.toUpperCase().replace('_', ' ')}] {service.name} — R$ {service.price.toFixed(2)} ({service.duration} min)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialist Selector matching Eligible specialists only */}
                  {selectedServiceId && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-sans text-gray-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#3d232e]" /> 2. Escolha sua Especialista Credenciada *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {eligibleSpecialists.map(sp => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setSelectedSpecialistId(sp.id)}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              selectedSpecialistId === sp.id
                                ? 'border-[#3d232e] bg-[#3d232e]/5 shadow-sm ring-1 ring-[#3d232e]'
                                : 'border-stone-150 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400'
                            }`}
                          >
                            <img src={sp.avatar} alt={sp.name} className="w-10 h-10 rounded-full object-cover border border-rose-100" referrerPolicy="no-referrer" />
                            <div>
                              <h5 className="font-sans font-semibold text-xs text-stone-850 leading-snug">{sp.name}</h5>
                              <p className="text-[10px] text-rose-500 font-sans tracking-wide leading-none mt-1 uppercase font-semibold">{sp.role.split(' ')[0]}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Date & Time grids */}
                  {selectedSpecialistId && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div>
                        <label className="text-xs font-sans text-gray-500 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-[#3d232e]" /> 3. Data Desejada *
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-stone-50 border border-rose-105 px-4 py-3 rounded-2xl text-xs focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-sans text-gray-500 font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#3d232e]" /> 4. Horários de Atendimento Disponíveis *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {AVAILABLE_TIMES.map((time, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`py-2 text-xs font-sans font-semibold rounded-xl border transition-all cursor-pointer ${
                                bookingTime === time
                                  ? 'bg-[#3d232e] border-stone-850 text-amber-200 shadow shadow-rose-950/20'
                                  : 'bg-stone-50 text-gray-600 border-transparent hover:border-stone-400'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Client Identification Fields */}
                  {bookingTime && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 border-t border-rose-100 pt-5"
                    >
                      <h5 className="text-[11px] font-sans text-stone-400 font-semibold uppercase tracking-wider">5. Dados Básicos para Reserva</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            required
                            placeholder="Seu nome completo *"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-stone-50 py-3.5 pl-10 pr-4 border border-rose-100 focus:ring-1 focus:ring-[#3d232e] rounded-2xl text-xs focus:outline-none text-gray-800 font-sans focus:bg-white"
                          />
                        </div>

                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="tel"
                            required
                            placeholder="WhatsApp para lembretes *"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full bg-stone-50 py-3.5 pl-10 pr-4 border border-rose-100 focus:ring-1 focus:ring-[#3d232e] rounded-2xl text-xs focus:outline-none text-gray-800 font-sans focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="email"
                            placeholder="Seu e-mail (opcional)"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="w-full bg-stone-50 py-3.5 pl-10 pr-4 border border-rose-100 focus:ring-1 focus:ring-[#3d232e] rounded-2xl text-xs focus:outline-none text-gray-800 font-sans focus:bg-white"
                          />
                        </div>

                        <div className="relative">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Escreva restrições, observações estéticas..."
                            value={clientNotes}
                            onChange={(e) => setClientNotes(e.target.value)}
                            className="w-full bg-stone-50 py-3.5 pl-10 pr-4 border border-rose-100 focus:ring-1 focus:ring-[#3d232e] rounded-2xl text-xs focus:outline-none text-gray-800 font-sans focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Summary visual card representation */}
                      <div className="bg-amber-500/5 border border-dashed border-amber-500/25 p-4 rounded-2xl">
                        <p className="text-[11px] text-amber-700 font-sans leading-relaxed text-center flex items-center justify-center gap-1.5 font-medium">
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" /> O agendamento é gratuito. Pague diretamente ao finalizar à especialista no salão físico!
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="w-full md:w-auto bg-[#3d232e] hover:bg-[#1a0f14] text-white font-sans text-xs font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          Confirmar Minha Reserva
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              )}
            </motion.div>
          ) : (
            // Appts List View
            <motion.div
              key="lista"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {appointments.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-3xl" id="no-appointments">
                  <CalendarIcon className="w-8 h-8 text-rose-300 mx-auto mb-3 animate-pulse" />
                  <h5 className="font-display font-medium text-gray-700 text-sm">Você não possui agendamentos</h5>
                  <p className="text-xs text-gray-400 font-sans mt-1">Quer dar uma mudada no visual de maneira inteligente? Faça uma reserva acima.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                  {appointments.map(appt => {
                    const serv = servicesDb.find(s => s.id === appt.serviceId);
                    const prof = SPECIALISTS.find(sp => sp.id === appt.specialistId);

                    return (
                      <div
                        key={appt.id}
                        className={`border rounded-2xl p-4.5 font-sans relative flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${
                          appt.status === 'CANCELADO'
                            ? 'bg-gray-50/80 border-gray-100 opacity-60'
                            : 'bg-white border-rose-50 hover:border-rose-100 shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              appt.status === 'CONFIRMADO' ? 'bg-emerald-55 text-emerald-700 border border-emerald-100 font-bold bg-emerald-50' : 'bg-gray-105 text-gray-500 border border-gray-200 font-bold bg-stone-100'
                            }`}>
                              {appt.status}
                            </span>
                            <span className="text-[10px] text-gray-450 font-mono">ID: {appt.id.slice(5, 12)}</span>
                          </div>

                          <h5 className="font-display font-semibold text-gray-900 text-sm">{serv?.name}</h5>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-sans mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-rose-400" /> Especialista: {prof?.name}
                            </span>
                            <span className="font-mono flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-rose-400" /> {new Date(appt.date).toLocaleDateString()} às {appt.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center justify-end border-t md:border-t-0 border-rose-50 pt-2.5 md:pt-0 shrink-0">
                          {appt.status === 'CONFIRMADO' && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="text-xs text-stone-400 hover:text-red-500 bg-stone-50 hover:bg-red-50 transition-colors p-2 rounded-xl border border-stone-100 flex items-center gap-1.5 cursor-pointer"
                              type="button"
                              title="Cancelar Reserva"
                            >
                              <Trash2 className="w-4 h-4" />
                              Cancelar
                            </button>
                          )}
                          <span className="text-xs font-semibold text-stone-800 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                            R$ {serv?.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
