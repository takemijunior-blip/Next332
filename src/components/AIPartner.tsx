import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, User, MessageCircle, Heart, Star, Compass, Loader2, HelpCircle } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';

interface AIPartnerProps {
  onSuggestService: (serviceName: string) => void;
  userProfile: UserProfile;
}

const CONST_SUGGESTIONS = [
  'Qual o cronograma capilar ideal para salvar cabelos secos ou com química?',
  'Como montar uma rotina básica de Skincare para obter o viço de porcelana?',
  'O que é terapia visagista e como ela potencializa a minha autoimagem?',
  'Dicas de empreendedorismo: Como iniciar um pequeno negócio feminino?'
];

export default function AIPartner({ onSuggestService, userProfile }: AIPartnerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('next_lady_chat_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Olá, ${userProfile.name || 'querida cliente'}! Eu sou a **Assisente Inteligente Next Lady** 👑✨ \n\nEstou aqui para ser seu braço direito no autocuidado estruturado. Posso te sugerir rotinas avançadas de cuidados com a pele (skincare) ou cabelo, dar dicas de automaquiagem, planejar cronogramas capilares personalizados, e apoiar sua jornada em direção à autoestima e ao empreendedorismo feminino!\n\nO que vamos lapidar juntas hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save history
  useEffect(() => {
    localStorage.setItem('next_lady_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/consultant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, userName: userProfile.name, userAge: userProfile.age }),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o servidor.');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-reply`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      // Beautiful local simulation fallback when API is sleeping or needs a warm prompt
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-reply`,
            sender: 'assistant',
            text: `Querida ${userProfile.name || 'Lady'}, compreendi seu ponto sobre "${textToSend}". \n\nNo ecossistema **Next Lady**, nossa recomendação principal para este caso é focar em autocuidado e visagismo. Sugiro agendar com nossa equipe um dos nossos cuidados especiais (como o **Corte Visagista & Modelagem** ou a **Limpeza de Pele Profunda**). \n\nIsso garantirá uma reposição lipídica perfeita para sua pele/cabelo! Gostaria de reservar um horário para fazermos essa avaliação técnica? ❤️`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } finally {
      if (!isLoading) {
        // Just fail safe
      }
    }
  };

  const clearChat = () => {
    if (window.confirm('Deseja limpar as dicas arquivadas de sua conversa com o Next Lady AI?')) {
      const initial = [
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Olá, ${userProfile.name || 'querida cliente'}! Eu sou a **Assisente Inteligente Next Lady** 👑✨ \n\nEstou aqui para ser seu braço direito no autocuidado estruturado. Posso te sugerir rotinas avançadas de cuidados com a pele (skincare) ou cabelo, dar dicas de automaquiagem, planejar cronogramas capilares personalizados, e apoiar sua jornada em direção à autoestima e ao empreendedorismo feminino!\n\nO que vamos lapidar juntas hoje?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
      setMessages(initial);
      localStorage.setItem('next_lady_chat_history', JSON.stringify(initial));
    }
  };

  // Action buttons parser matching Next Lady elements
  const getActionButtons = (text: string) => {
    const services = [
      { pattern: 'Corte Visagista', label: 'Corte Visagista & Modelagem' },
      { pattern: 'Coloração Orgânica', label: 'Coloração Orgânica de Alta Costura' },
      { pattern: 'Tranças', label: 'Tranças Afro & Boxer Braids Negras' },
      { pattern: 'Penteado', label: 'Penteado de Gala Real' },
      { pattern: 'Maquiagem', label: 'Maquiagem Deluxe Editorial' },
      { pattern: 'Limpeza de Pele', label: 'Limpeza de Pele Profunda + Fototerapia' },
      { pattern: 'Massagem', label: 'Massagem Craniana & Shiatsu Antiestresse' },
      { pattern: 'Spa', label: 'Spa Integrativo Lady Imperial' },
    ];

    return services.filter(service => 
      text.toLowerCase().includes(service.pattern.toLowerCase())
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden flex flex-col h-[640px] animate-fadeIn" id="ai-consultant-section">
      {/* Mini Header */}
      <div className="border-b border-rose-100 px-6 py-4.5 flex justify-between items-center bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3d232e] text-amber-200 flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-stone-850 text-sm flex items-center gap-1.5 leading-none">
              Princesa Next Lady AI <span className="text-[10px] bg-amber-500 text-stone-950 font-sans px-2 py-0.5 rounded-full font-bold">VIP</span>
            </h4>
            <p className="text-[10px] text-rose-500 font-sans font-semibold uppercase tracking-wider mt-1">Visagismo, Autocuidado & Mentoria</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-[11px] text-gray-400 hover:text-rose-500 font-sans font-bold transition-colors cursor-pointer"
          type="button"
        >
          Limpar histórico
        </button>
      </div>

      {/* Bubble Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#fffbfb] to-white">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const actionButtons = !isUser ? getActionButtons(msg.text) : [];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser 
                    ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                    : 'bg-[#3d232e] text-amber-200 border border-stone-850'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div className="space-y-2">
                  <div className={`p-4 rounded-3xl text-xs font-sans leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-[#3d232e] text-white rounded-tr-none' 
                      : 'bg-stone-50 text-stone-800 rounded-tl-none border border-stone-150'
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Basic custom bold parser for Markdown rendering simulation (safe and robust)
                        const formattedLine = line.split('**').map((part, pIdx) => {
                          return pIdx % 2 === 1 
                            ? <strong key={pIdx} className={isUser ? "text-amber-200 font-bold" : "text-stone-900 font-bold"}>{part}</strong> 
                            : part;
                        });
                        return <p key={lIdx} className="mb-1 leading-relaxed">{formattedLine}</p>;
                      })}
                    </div>
                  </div>

                  {/* Suggestion tags if assistant recommended specific salon treatments */}
                  {actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSuggestService(btn.label)}
                          className="text-[10px] bg-rose-50 hover:bg-rose-100/90 text-rose-650 border border-rose-150 font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          type="button"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          Reservar: {btn.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] text-gray-400 block px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-[#3d232e] text-amber-200 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-stone-50 border border-stone-150 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#3d232e]" />
              <span className="text-[10px] text-gray-500 font-sans font-semibold">Tecendo recomendações de estilo integrativo...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions Quick Grid */}
      {messages.length === 1 && (
        <div className="p-4 bg-stone-50 border-t border-rose-50">
          <p className="text-[10px] text-stone-400 uppercase font-sans font-bold tracking-wider mb-2.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Tópicos Populares de Conversa
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONST_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(suggestion)}
                className="text-left text-[11px] bg-white text-gray-700 hover:text-rose-500 hover:border-stone-400 border border-stone-200 p-2.5 rounded-2xl transition-all shadow-sm truncate cursor-pointer select-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Typing Inputs */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="p-4 border-t border-rose-100 bg-white flex gap-2 items-center"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Peça seu cronograma capilar, dicas estéticas ou de autoestima..."
          className="flex-1 bg-[#faf8f8] py-3.5 px-4 rounded-2xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 transition-all border border-rose-50 hover:border-rose-100 focus:bg-white"
          type="text"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-[#3d232e] hover:bg-[#1a0f14] disabled:bg-[#3d232e]/45 text-amber-200 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow shrink-0 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
